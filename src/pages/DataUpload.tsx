import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DataUpload = () => {
  const [datasetName, setDatasetName] = useState("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(",");
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = values[i]?.trim() || "";
          });
          return row;
        });

      setColumns(headers);
      setCsvData(data);
      toast({ title: "CSV loaded successfully" });
    };
    reader.readAsText(file);
  };

  const saveDataset = async () => {
    if (!datasetName || csvData.length === 0) {
      toast({ title: "Please provide a name and upload data", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("di_datasets").insert({
      user_id: user.id,
      name: datasetName,
      data: csvData,
      schema: { columns },
      row_count: csvData.length,
      column_count: columns.length
    });

    if (error) {
      toast({ title: "Error saving dataset", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dataset saved successfully" });
      setDatasetName("");
      setCsvData([]);
      setColumns([]);
    }
  };

  const removeColumn = (colName: string) => {
    setColumns(columns.filter(c => c !== colName));
    setCsvData(csvData.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    }));
  };

  return (
    <div className="h-screen bg-background p-6 overflow-y-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/data-intelligence">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Data Upload</h1>
            <p className="text-muted-foreground">Upload and clean CSV datasets</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset Name</label>
            <Input
              placeholder="e.g., Athletes Performance Q1"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload CSV</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drop your CSV file here or click to browse</p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>

          {csvData.length > 0 && (
            <>
              <div className="flex gap-2">
                <Button onClick={saveDataset} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Save Dataset
                </Button>
              </div>

              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col}>
                          <div className="flex items-center justify-between gap-2">
                            {col}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeColumn(col)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {columns.map((col) => (
                          <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing first 10 rows of {csvData.length} total rows
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DataUpload;
