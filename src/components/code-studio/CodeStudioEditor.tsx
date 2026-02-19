import Editor from "@monaco-editor/react";
import type { CodeFileRecord } from "@/hooks/useCodeProjects";

interface Props {
  file: CodeFileRecord;
  onChange: (content: string) => void;
}

const CodeStudioEditor = ({ file, onChange }: Props) => {
  return (
    <Editor
      height="100%"
      language={file.language}
      value={file.content}
      onChange={(value) => onChange(value ?? "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        padding: { top: 12 },
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        suggestOnTriggerCharacters: true,
      }}
    />
  );
};

export default CodeStudioEditor;
