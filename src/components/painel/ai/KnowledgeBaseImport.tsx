import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KnowledgeBaseForm } from "@/hooks/painel/useAgentKnowledge";

interface KnowledgeBaseImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: KnowledgeBaseForm[]) => void;
  isLoading?: boolean;
}

interface ParsedRow {
  question: string;
  answer: string;
  category?: string;
  isValid: boolean;
  error?: string;
}

export function KnowledgeBaseImport({
  open,
  onOpenChange,
  onImport,
  isLoading,
}: KnowledgeBaseImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setParseError("Por favor, selecione um arquivo CSV.");
      return;
    }

    setFile(selectedFile);
    setParseError(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      setParsedData(rows);
    } catch (err: any) {
      setParseError(err.message || "Erro ao processar arquivo.");
      setParsedData([]);
    }
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("Arquivo deve ter pelo menos um cabeçalho e uma linha de dados.");
    }

    const header = lines[0].toLowerCase();
    const hasCategory = header.includes("categoria") || header.includes("category");

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < 2) {
        rows.push({
          question: values[0] || "",
          answer: "",
          isValid: false,
          error: "Linha incompleta",
        });
        continue;
      }

      const question = values[0]?.trim() || "";
      const answer = values[1]?.trim() || "";
      const category = hasCategory ? values[2]?.trim() : undefined;

      const isValid = question.length >= 10 && answer.length >= 20;
      const error = !isValid
        ? question.length < 10
          ? "Pergunta muito curta"
          : "Resposta muito curta"
        : undefined;

      rows.push({ question, answer, category, isValid, error });
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === "," || char === ";") && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const validRows = parsedData.filter((r) => r.isValid);
  const invalidRows = parsedData.filter((r) => !r.isValid);

  const handleImport = () => {
    const items: KnowledgeBaseForm[] = validRows.map((row) => ({
      question: row.question,
      answer: row.answer,
      category: row.category,
    }));
    onImport(items);
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setParseError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Base de Conhecimento
          </DialogTitle>
          <DialogDescription>
            Importe perguntas e respostas de um arquivo CSV. O arquivo deve ter colunas:
            Pergunta, Resposta, Categoria (opcional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">Clique para selecionar arquivo CSV</p>
              <p className="text-sm text-muted-foreground mt-1">
                ou arraste e solte aqui
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {parseError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              {parsedData.length > 0 && (
                <>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      {validRows.length} válidas
                    </span>
                    {invalidRows.length > 0 && (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {invalidRows.length} com erros
                      </span>
                    )}
                  </div>

                  <ScrollArea className="h-[300px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8">#</TableHead>
                          <TableHead>Pergunta</TableHead>
                          <TableHead>Resposta</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.map((row, idx) => (
                          <TableRow
                            key={idx}
                            className={row.isValid ? "" : "bg-destructive/5"}
                          >
                            <TableCell className="font-mono text-xs">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {row.question}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {row.answer}
                            </TableCell>
                            <TableCell>{row.category || "-"}</TableCell>
                            <TableCell>
                              {row.isValid ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <span className="text-xs text-destructive">
                                  {row.error}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={isLoading || validRows.length === 0}
          >
            {isLoading ? (
              <>
                <Progress value={50} className="w-20 mr-2" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar {validRows.length} perguntas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
