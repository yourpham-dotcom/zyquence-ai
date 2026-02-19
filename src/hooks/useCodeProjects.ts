import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CodeProject {
  id: string;
  name: string;
  description: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface CodeFileRecord {
  id: string;
  project_id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  is_folder: boolean;
}

const getLanguage = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    py: "python", js: "javascript", ts: "typescript", tsx: "typescript",
    jsx: "javascript", html: "html", css: "css", json: "json", md: "markdown",
    sql: "sql", java: "java", cpp: "cpp", c: "c", rb: "ruby", go: "go",
    rs: "rust", sh: "shell",
  };
  return map[ext] ?? "plaintext";
};

export function useCodeProjects() {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [activeProject, setActiveProject] = useState<CodeProject | null>(null);
  const [files, setFiles] = useState<CodeFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const { toast } = useToast();

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load projects
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("code_projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (data) {
        setProjects(data as CodeProject[]);
        if (data.length > 0 && !activeProject) {
          setActiveProject(data[0] as CodeProject);
        }
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  // Load files when project changes
  useEffect(() => {
    if (!activeProject) { setFiles([]); return; }
    const load = async () => {
      const { data } = await supabase
        .from("code_files")
        .select("*")
        .eq("project_id", activeProject.id)
        .order("is_folder", { ascending: false })
        .order("path")
        .order("name");
      if (data) setFiles(data as CodeFileRecord[]);
    };
    load();
  }, [activeProject?.id]);

  const createProject = useCallback(async (name: string) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("code_projects")
      .insert({ name, user_id: userId })
      .select()
      .single();
    if (error) { toast({ title: "Error creating project", variant: "destructive" }); return null; }
    const project = data as CodeProject;
    setProjects((prev) => [project, ...prev]);
    setActiveProject(project);

    // Create default file
    await supabase.from("code_files").insert({
      project_id: project.id,
      user_id: userId,
      name: "main.js",
      path: "/",
      content: '// Welcome to ' + name + '\nconsole.log("Hello from Zyquence!");\n',
      language: "javascript",
    });

    const { data: filesData } = await supabase
      .from("code_files")
      .select("*")
      .eq("project_id", project.id);
    if (filesData) setFiles(filesData as CodeFileRecord[]);

    return project;
  }, [userId, toast]);

  const deleteProject = useCallback(async (id: string) => {
    await supabase.from("code_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(projects.find((p) => p.id !== id) ?? null);
    }
  }, [activeProject, projects]);

  const createFile = useCallback(async (name: string, path: string = "/", isFolder = false) => {
    if (!activeProject || !userId) return null;
    const { data, error } = await supabase
      .from("code_files")
      .insert({
        project_id: activeProject.id,
        user_id: userId,
        name,
        path,
        content: isFolder ? "" : "",
        language: isFolder ? "plaintext" : getLanguage(name),
        is_folder: isFolder,
      })
      .select()
      .single();
    if (error) { toast({ title: "Error creating file", variant: "destructive" }); return null; }
    const file = data as CodeFileRecord;
    setFiles((prev) => [...prev, file]);
    return file;
  }, [activeProject, userId, toast]);

  const renameFile = useCallback(async (id: string, newName: string) => {
    await supabase.from("code_files").update({ name: newName, language: getLanguage(newName) }).eq("id", id);
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: newName, language: getLanguage(newName) } : f));
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.is_folder) {
      // Delete all files in this folder
      const folderPath = file.path === "/" ? `/${file.name}` : `${file.path}/${file.name}`;
      const children = files.filter((f) => f.path.startsWith(folderPath));
      for (const child of children) {
        await supabase.from("code_files").delete().eq("id", child.id);
      }
      setFiles((prev) => prev.filter((f) => !f.path.startsWith(folderPath) && f.id !== id));
    }
    await supabase.from("code_files").delete().eq("id", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, [files]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, content } : f));

    // Debounced auto-save
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      await supabase.from("code_files").update({ content, updated_at: new Date().toISOString() }).eq("id", id);
    }, 1500);
  }, []);

  return {
    projects, activeProject, setActiveProject, files,
    loading, userId,
    createProject, deleteProject,
    createFile, renameFile, deleteFile, updateFileContent,
  };
}
