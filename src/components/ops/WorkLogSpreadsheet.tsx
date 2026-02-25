import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Loader2, Save, X, Pencil,
  Download, FileSpreadsheet, Clock, DollarSign, Users, ShieldAlert
} from "lucide-react";

type WorkLog = {
  id: string;
  employee_name: string;
  work_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  hourly_rate: number;
  total_pay: number;
  notes: string | null;
  created_at: string;
};

export type WorkLogSpreadsheetHandle = {
  refresh: () => void;
  getLogs: () => WorkLog[];
};

type Props = {
  refreshKey?: number;
  onLogsChange?: (logs: WorkLog[]) => void;
};

const WorkLogSpreadsheet = forwardRef<WorkLogSpreadsheetHandle, Props>(({ refreshKey, onLogsChange }, ref) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<WorkLog>>({});

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("work_logs")
      .select("*")
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) {
      const typed = data as unknown as WorkLog[];
      setLogs(typed);
      onLogsChange?.(typed);
    }
    setLoading(false);
  }, [user, onLogsChange]);

  useEffect(() => { fetchLogs(); }, [fetchLogs, refreshKey]);

  useImperativeHandle(ref, () => ({
    refresh: fetchLogs,
    getLogs: () => logs,
  }), [fetchLogs, logs]);

  const calcHours = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, Math.round((diff / 60) * 100) / 100);
  };

  const addBlank = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("work_logs").insert({
      user_id: user.id,
      employee_name: "",
      work_date: new Date().toISOString().split("T")[0],
      start_time: "09:00",
      end_time: "17:00",
      hours: 8,
      hourly_rate: 0,
      total_pay: 0,
    } as any).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const newLog = data as unknown as WorkLog;
    const updated = [newLog, ...logs];
    setLogs(updated);
    onLogsChange?.(updated);
    setEditingId(newLog.id);
    setEditValues(newLog);
  };

  const startEdit = (log: WorkLog) => {
    setEditingId(log.id);
    setEditValues({ ...log });
  };

  const updateEditField = (field: keyof WorkLog, value: any) => {
    setEditValues(prev => {
      const next = { ...prev, [field]: value };
      if (field === "start_time" || field === "end_time") {
        const s = field === "start_time" ? value : (prev.start_time || "09:00");
        const e = field === "end_time" ? value : (prev.end_time || "17:00");
        const h = calcHours(s, e);
        next.hours = h;
        next.total_pay = Math.round(h * (prev.hourly_rate || 0) * 100) / 100;
      }
      if (field === "hourly_rate") {
        next.total_pay = Math.round((prev.hours || 0) * (parseFloat(value) || 0) * 100) / 100;
      }
      if (field === "hours") {
        next.total_pay = Math.round((parseFloat(value) || 0) * (prev.hourly_rate || 0) * 100) / 100;
      }
      return next;
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("work_logs").update({
      employee_name: editValues.employee_name,
      work_date: editValues.work_date,
      start_time: editValues.start_time,
      end_time: editValues.end_time,
      hours: editValues.hours,
      hourly_rate: editValues.hourly_rate,
      total_pay: editValues.total_pay,
      notes: editValues.notes,
    } as any).eq("id", editingId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const updated = logs.map(l => l.id === editingId ? { ...l, ...editValues } as WorkLog : l);
    setLogs(updated);
    onLogsChange?.(updated);
    setEditingId(null);
    setEditValues({});
  };

  const deleteLog = async (id: string) => {
    await supabase.from("work_logs").delete().eq("id", id);
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    onLogsChange?.(updated);
  };

  const totalHours = logs.reduce((s, l) => s + (l.hours || 0), 0);
  const totalPayroll = logs.reduce((s, l) => s + (l.total_pay || 0), 0);
  const uniqueEmployees = new Set(logs.map(l => l.employee_name).filter(Boolean)).size;

  const exportCSV = () => {
    const headers = ["Employee Name", "Date", "Start Time", "End Time", "Hours Worked", "Hourly Rate", "Total Pay", "Notes"];
    const rows = logs.map(l => [l.employee_name, l.work_date, l.start_time, l.end_time, l.hours, l.hourly_rate, l.total_pay, l.notes || ""]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `worklog_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported CSV" });
  };

  const exportXLSX = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const headers = ["Employee Name", "Date", "Start Time", "End Time", "Hours Worked", "Hourly Rate", "Total Pay", "Notes"];
      const rowsXml = logs.map(l => {
        const cells = [l.employee_name, l.work_date, l.start_time, l.end_time, String(l.hours), String(l.hourly_rate), String(l.total_pay), l.notes || ""];
        return `<row>${cells.map(c => `<c t="inlineStr"><is><t>${escapeXml(c)}</t></is></c>`).join("")}</row>`;
      });
      const headerRow = `<row>${headers.map(h => `<c t="inlineStr"><is><t>${h}</t></is></c>`).join("")}</row>`;
      const sheetData = `${headerRow}${rowsXml.join("")}`;
      const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetData}</sheetData></worksheet>`;
      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;
      const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="WorkLog" sheetId="1" r:id="rId1"/></sheets></workbook>`;
      const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
      const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
      const zip = new JSZip();
      zip.file("[Content_Types].xml", contentTypes);
      zip.file("_rels/.rels", rootRels);
      zip.file("xl/workbook.xml", workbook);
      zip.file("xl/_rels/workbook.xml.rels", wbRels);
      zip.file("xl/worksheets/sheet1.xml", sheet);
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `worklog_${new Date().toISOString().split("T")[0]}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported Excel" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div>
          <div><p className="text-[10px] text-muted-foreground">Total Hours</p><p className="text-sm font-bold">{totalHours.toFixed(1)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
          <div><p className="text-[10px] text-muted-foreground">Total Payroll</p><p className="text-sm font-bold">${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
          <div><p className="text-[10px] text-muted-foreground">Employees</p><p className="text-sm font-bold">{uniqueEmployees}</p></div>
        </CardContent></Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={addBlank}><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
        <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" /> CSV</Button>
        <Button size="sm" variant="outline" onClick={exportXLSX}><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldAlert className="h-3 w-3" />
          Images are processed only to extract work log data and are not stored.
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-2 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Start</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">End</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Hours</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Total Pay</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Notes</th>
                  <th className="text-center p-2 font-medium text-muted-foreground w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">No work logs yet. Add a row or use the assistant!</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                    {editingId === log.id ? (
                      <>
                        <td className="p-1"><Input className="h-7 text-xs" value={editValues.employee_name || ""} onChange={e => updateEditField("employee_name", e.target.value)} placeholder="Name" /></td>
                        <td className="p-1"><Input className="h-7 text-xs" type="date" value={editValues.work_date || ""} onChange={e => updateEditField("work_date", e.target.value)} /></td>
                        <td className="p-1"><Input className="h-7 text-xs" type="time" value={editValues.start_time || ""} onChange={e => updateEditField("start_time", e.target.value)} /></td>
                        <td className="p-1"><Input className="h-7 text-xs" type="time" value={editValues.end_time || ""} onChange={e => updateEditField("end_time", e.target.value)} /></td>
                        <td className="p-1"><Input className="h-7 text-xs text-right" type="number" step="0.01" value={editValues.hours ?? 0} onChange={e => updateEditField("hours", parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1"><Input className="h-7 text-xs text-right" type="number" step="0.01" value={editValues.hourly_rate ?? 0} onChange={e => updateEditField("hourly_rate", parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-1 text-right font-mono text-xs">${(editValues.total_pay || 0).toFixed(2)}</td>
                        <td className="p-1"><Input className="h-7 text-xs" value={editValues.notes || ""} onChange={e => updateEditField("notes", e.target.value)} /></td>
                        <td className="p-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}><Save className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingId(null); setEditValues({}); }}><X className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 font-medium">{log.employee_name || <span className="text-muted-foreground italic">—</span>}</td>
                        <td className="p-2">{log.work_date}</td>
                        <td className="p-2 font-mono">{log.start_time}</td>
                        <td className="p-2 font-mono">{log.end_time}</td>
                        <td className="p-2 text-right font-mono">{log.hours}</td>
                        <td className="p-2 text-right font-mono">${(log.hourly_rate || 0).toFixed(2)}</td>
                        <td className="p-2 text-right font-mono font-medium">${(log.total_pay || 0).toFixed(2)}</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[120px]">{log.notes || "—"}</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(log)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteLog(log.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

WorkLogSpreadsheet.displayName = "WorkLogSpreadsheet";
export default WorkLogSpreadsheet;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
