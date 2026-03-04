import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ZoomIn, ZoomOut, Maximize2, Pencil, Save, Trash2, Plus, GripVertical } from "lucide-react";

export type WorkflowNode = {
  id: string;
  label: string;
  description?: string | null;
  owner?: string | null;
  status: string;
  node_type: string;
  position_x: number;
  position_y: number;
  sort_order: number;
  project_id: string;
};

export type WorkflowEdge = {
  id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string | null;
  project_id: string;
};

type Props = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeUpdate?: (node: WorkflowNode) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeAdd?: () => void;
  onEdgeDelete?: (edgeId: string) => void;
  onNodePositionUpdate?: (nodeId: string, x: number, y: number) => void;
};

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  start: { bg: "bg-green-500/10", border: "border-green-500/40", text: "text-green-600" },
  end: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-600" },
  decision: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-600" },
  step: { bg: "bg-primary/5", border: "border-primary/30", text: "text-foreground" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-500",
  complete: "bg-green-500/10 text-green-500",
  blocked: "bg-red-500/10 text-red-500",
};

export function WorkflowMap({ nodes, edges, onNodeUpdate, onNodeDelete, onNodeAdd, onEdgeDelete, onNodePositionUpdate }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const NODE_W = 180;
  const NODE_H = 80;

  // Auto-layout nodes if positions are all 0
  const layoutNodes = useCallback(() => {
    const allZero = nodes.every(n => n.position_x === 0 && n.position_y === 0);
    if (!allZero || nodes.length === 0) return nodes;

    // Simple layered layout using topological sort
    const adj = new Map<string, string[]>();
    const inDeg = new Map<string, number>();
    nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0); });
    edges.forEach(e => {
      adj.get(e.source_node_id)?.push(e.target_node_id);
      inDeg.set(e.target_node_id, (inDeg.get(e.target_node_id) || 0) + 1);
    });

    const layers: string[][] = [];
    let queue = nodes.filter(n => (inDeg.get(n.id) || 0) === 0).map(n => n.id);
    const visited = new Set<string>();

    while (queue.length > 0) {
      layers.push([...queue]);
      queue.forEach(id => visited.add(id));
      const next: string[] = [];
      for (const id of queue) {
        for (const target of adj.get(id) || []) {
          if (!visited.has(target)) {
            const remaining = (inDeg.get(target) || 1) - 1;
            inDeg.set(target, remaining);
            if (remaining <= 0) next.push(target);
          }
        }
      }
      queue = next;
    }

    // Add any unvisited nodes
    const unvisited = nodes.filter(n => !visited.has(n.id));
    if (unvisited.length) layers.push(unvisited.map(n => n.id));

    const positioned = new Map<string, { x: number; y: number }>();
    const GAP_X = 260;
    const GAP_Y = 120;

    layers.forEach((layer, li) => {
      const totalHeight = layer.length * NODE_H + (layer.length - 1) * (GAP_Y - NODE_H);
      const startY = -totalHeight / 2;
      layer.forEach((id, ni) => {
        positioned.set(id, { x: li * GAP_X + 40, y: startY + ni * GAP_Y + 200 });
      });
    });

    return nodes.map(n => {
      const pos = positioned.get(n.id);
      return pos ? { ...n, position_x: pos.x, position_y: pos.y } : n;
    });
  }, [nodes, edges]);

  const displayNodes = layoutNodes();

  const getNodeCenter = (nodeId: string) => {
    const node = displayNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.position_x + NODE_W / 2, y: node.position_y + NODE_H / 2 };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingNode) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(z => Math.min(Math.max(z + delta, 0.3), 2));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (draggingNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      onNodePositionUpdate?.(draggingNode, x, y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  const handleNodeDragStart = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({ x: mouseX - node.position_x, y: mouseY - node.position_y });
    setDraggingNode(node.id);
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Draw arrow
  const renderEdge = (edge: WorkflowEdge) => {
    const from = getNodeCenter(edge.source_node_id);
    const to = getNodeCenter(edge.target_node_id);
    if (from.x === 0 && from.y === 0) return null;

    // Calculate edge points on node borders
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;

    const nx = dx / dist;
    const ny = dy / dist;

    const startX = from.x + nx * (NODE_W / 2);
    const startY = from.y + ny * (NODE_H / 2);
    const endX = to.x - nx * (NODE_W / 2 + 8);
    const endY = to.y - ny * (NODE_H / 2 + 8);

    // Curved path
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const cpOffset = Math.min(dist * 0.2, 40);
    const cpX = midX - ny * cpOffset;
    const cpY = midY + nx * cpOffset;

    return (
      <g key={edge.id}>
        <path
          d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1.5}
          strokeOpacity={0.4}
          markerEnd="url(#arrowhead)"
        />
        {edge.label && (
          <text x={cpX} y={cpY - 8} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10} opacity={0.7}>
            {edge.label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {onNodeAdd && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onNodeAdd}>
            <Plus className="h-3 w-3 mr-1" /> Add Node
          </Button>
        )}
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(z + 0.15, 2))}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={resetView}>
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-muted/20 rounded-lg border border-border/50 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ overflow: "visible", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(renderEdge)}

          {/* Nodes */}
          {displayNodes.map(node => {
            const colors = NODE_COLORS[node.node_type] || NODE_COLORS.step;
            const isSelected = selectedNode === node.id;
            const isDragging = draggingNode === node.id;

            return (
              <g key={node.id} transform={`translate(${node.position_x}, ${node.position_y})`}>
                {/* Node shape */}
                {node.node_type === "decision" ? (
                  <g transform={`translate(${NODE_W / 2}, ${NODE_H / 2})`}>
                    <polygon
                      points={`0,${-NODE_H / 2} ${NODE_W / 2},0 0,${NODE_H / 2} ${-NODE_W / 2},0`}
                      className={`fill-background stroke-2 ${isSelected ? "stroke-primary" : "stroke-border"}`}
                      strokeWidth={isSelected ? 2 : 1}
                      cursor="pointer"
                      onClick={() => setSelectedNode(node.id)}
                      onMouseDown={(e) => handleNodeDragStart(e, node)}
                    />
                    <text textAnchor="middle" y={4} className="fill-foreground text-xs font-medium" fontSize={11} pointerEvents="none">
                      {node.label.length > 18 ? node.label.slice(0, 18) + "…" : node.label}
                    </text>
                  </g>
                ) : (
                  <>
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={node.node_type === "start" || node.node_type === "end" ? 40 : 10}
                      className={`fill-background ${isSelected ? "stroke-primary" : "stroke-border"}`}
                      strokeWidth={isSelected ? 2 : 1}
                      cursor="pointer"
                      onClick={() => setSelectedNode(node.id)}
                      onMouseDown={(e) => handleNodeDragStart(e, node)}
                    />
                    {/* Label */}
                    <text x={NODE_W / 2} y={NODE_H / 2 - 6} textAnchor="middle" className="fill-foreground text-xs font-medium" fontSize={12} pointerEvents="none">
                      {node.label.length > 22 ? node.label.slice(0, 22) + "…" : node.label}
                    </text>
                    {/* Status badge */}
                    <text x={NODE_W / 2} y={NODE_H / 2 + 12} textAnchor="middle" className="fill-muted-foreground" fontSize={9} pointerEvents="none">
                      {node.owner || node.status}
                    </text>
                    {/* Type indicator */}
                    {(node.node_type === "start" || node.node_type === "end") && (
                      <circle
                        cx={12}
                        cy={NODE_H / 2}
                        r={4}
                        fill={node.node_type === "start" ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected node details */}
      {selectedNode && (() => {
        const node = displayNodes.find(n => n.id === selectedNode);
        if (!node) return null;
        return (
          <Card className="absolute bottom-3 left-3 z-10 w-72 shadow-lg">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{node.label}</span>
                <div className="flex items-center gap-1">
                  {onNodeUpdate && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNode(node)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {onNodeDelete && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { onNodeDelete(node.id); setSelectedNode(null); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {node.description && <p className="text-xs text-muted-foreground">{node.description}</p>}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[node.status] || ""}`}>
                  {node.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{node.node_type}</Badge>
                {node.owner && <span className="text-[10px] text-muted-foreground">Owner: {node.owner}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Edit node modal */}
      {editingNode && (
        <Card className="absolute top-3 left-3 z-20 w-72 shadow-lg">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Edit Node</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditingNode(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={editingNode.label}
              onChange={e => setEditingNode({ ...editingNode, label: e.target.value })}
              className="h-7 text-xs"
              placeholder="Label"
            />
            <Input
              value={editingNode.description || ""}
              onChange={e => setEditingNode({ ...editingNode, description: e.target.value })}
              className="h-7 text-xs"
              placeholder="Description"
            />
            <Input
              value={editingNode.owner || ""}
              onChange={e => setEditingNode({ ...editingNode, owner: e.target.value })}
              className="h-7 text-xs"
              placeholder="Owner"
            />
            <select
              value={editingNode.status}
              onChange={e => setEditingNode({ ...editingNode, status: e.target.value })}
              className="w-full h-7 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="blocked">Blocked</option>
            </select>
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => {
                onNodeUpdate?.(editingNode);
                setEditingNode(null);
              }}
            >
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
