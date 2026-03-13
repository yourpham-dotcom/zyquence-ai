import { useState, useCallback, useRef } from "react";
import { ExternalLink, Youtube, Globe, BookOpen, X, Upload, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PdfCanvasViewer } from "./PdfCanvasViewer";

type PanelType = "youtube" | "learn" | null;

interface PdfFile {
  name: string;
  url: string;
}

const links = [
  { label: "YouTube", id: "youtube" as const, icon: Youtube, color: "text-red-500" },
  { label: "Browse", id: "open" as const, icon: Globe, href: "https://www.google.com", color: "text-blue-500" },
  { label: "Learn", id: "learn" as const, icon: BookOpen, color: "text-orange-500" },
];

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 350;

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Learn / PDF state
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>(() => {
    try {
      const saved = localStorage.getItem("zyquence-pdf-library");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activePdf, setActivePdf] = useState<PdfFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savePdfFiles = (files: PdfFile[]) => {
    setPdfFiles(files);
    // We don't save blob URLs to localStorage since they expire
    // Just save names for display, files need to be re-added on refresh
    localStorage.setItem("zyquence-pdf-library", JSON.stringify(files.map(f => ({ name: f.name, url: "" }))));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPdfs: PdfFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        newPdfs.push({ name: file.name, url });
      }
    });

    if (newPdfs.length > 0) {
      const updated = [...pdfFiles, ...newPdfs];
      setPdfFiles(updated);
      if (!activePdf) setActivePdf(newPdfs[0]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePdf = (index: number) => {
    const file = pdfFiles[index];
    if (file.url) URL.revokeObjectURL(file.url);
    const updated = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(updated);
    if (activePdf === file) setActivePdf(updated[0] || null);
  };

  const handlePdfDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (files.length === 0) return;

    const newPdfs = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPdfFiles(prev => {
      const updated = [...prev, ...newPdfs];
      return updated;
    });
    if (!activePdf) setActivePdf(newPdfs[0]);
  }, [activePdf]);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const handlePlay = () => {
    const id = extractVideoId(videoUrl.trim());
    if (id) setEmbedId(id);
  };

  const handleLinkClick = (link: typeof links[number]) => {
    if (link.id === "youtube") {
      setActivePanel(activePanel === "youtube" ? null : "youtube");
    } else if (link.id === "learn") {
      setActivePanel(activePanel === "learn" ? null : "learn");
    } else if ("href" in link && link.href) {
      window.open(link.href, "_blank");
    }
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = panelHeight;

    const onMove = (ev: MouseEvent) => {
      const delta = startY.current - ev.clientY;
      const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
      setPanelHeight(newH);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelHeight]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = panelHeight;

    const onMove = (ev: TouchEvent) => {
      const delta = startY.current - ev.touches[0].clientY;
      const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
      setPanelHeight(newH);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [panelHeight]);

  return (
    <div className="border-t border-border bg-background shrink-0 flex flex-col relative">
      {isDragging && <div className="fixed inset-0 z-50 cursor-ns-resize" />}

      {/* YouTube Panel */}
      {activePanel === "youtube" && (
        <div className="border-b border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
          <div
            onMouseDown={onDragStart}
            onTouchStart={onTouchStart}
            className="flex items-center justify-center py-2 cursor-ns-resize hover:bg-accent/30 transition-colors select-none touch-none"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-foreground">YouTube Player</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => window.open("https://www.youtube.com", "_blank")}>
                Open YouTube
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <Input
              placeholder="Paste a YouTube URL or video ID..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePlay()}
              className="h-8 text-xs flex-1"
            />
            <Button size="sm" className="h-8 text-xs px-4" onClick={handlePlay}>Play</Button>
          </div>
          <div className="px-4 pb-4 flex-1" style={{ height: panelHeight }}>
            {embedId ? (
              <div className="rounded-lg overflow-hidden bg-black h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  title="YouTube Player"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Youtube className="h-8 w-8 text-red-500/50" />
                <p className="text-xs">Paste a YouTube link above to watch here</p>
                <p className="text-[10px]">Or click "Open YouTube" to browse in a new tab</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learn / PDF Reader Panel */}
      {activePanel === "learn" && (
        <div className="border-b border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
          <div
            onMouseDown={onDragStart}
            onTouchStart={onTouchStart}
            className="flex items-center justify-center py-2 cursor-ns-resize hover:bg-accent/30 transition-colors select-none touch-none"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-foreground">Library</span>
              <span className="text-[10px] text-muted-foreground">({pdfFiles.length} books)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handlePdfUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Add PDF
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1" style={{ height: panelHeight }}>
            {/* Sidebar file list */}
            <div className="w-48 shrink-0 border-r border-border overflow-y-auto px-2 pb-2">
              {pdfFiles.length === 0 ? (
                <div className="text-[10px] text-muted-foreground text-center py-4">
                  No PDFs yet
                </div>
              ) : (
                <div className="space-y-1">
                  {pdfFiles.map((pdf, i) => (
                    <button
                      key={i}
                      onClick={() => pdf.url ? setActivePdf(pdf) : null}
                      className={cn(
                        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-left text-xs transition-colors group",
                        activePdf === pdf ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground"
                      )}
                    >
                      <FileText className="h-3 w-3 shrink-0 text-orange-500" />
                      <span className="truncate flex-1">{pdf.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemovePdf(i); }}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PDF viewer */}
            <div
              className="flex-1 px-2 pb-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePdfDrop}
            >
              {activePdf?.url ? (
                <div className="w-full h-full flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-muted-foreground truncate">{activePdf.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] gap-1 shrink-0"
                      onClick={() => window.open(activePdf.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open in new tab
                    </Button>
                  </div>
                  <PdfCanvasViewer fileUrl={activePdf.url} className="flex-1 min-h-0" />
                </div>
              ) : (
                <div
                  className="rounded-lg bg-muted/50 flex flex-col items-center justify-center h-full gap-2 text-muted-foreground border-2 border-dashed border-border"
                >
                  <BookOpen className="h-8 w-8 text-orange-500/50" />
                  <p className="text-xs font-medium">Drop PDF files here or click "Add PDF"</p>
                  <p className="text-[10px]">Read books, textbooks, and documents right in your workspace</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Icon Bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => handleLinkClick(link)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group",
              (link.id === "youtube" && activePanel === "youtube") && "bg-accent/50",
              (link.id === "learn" && activePanel === "learn") && "bg-accent/50"
            )}
          >
            <link.icon className={cn("h-5 w-5", link.color)} />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
