import { useState } from "react";
import { FileWarning, Filter, RefreshCw, BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessingLogsTable } from "@/components/admin/ai-agents/ProcessingLogsTable";
import { useProcessingLogs, useProcessingLogStats } from "@/hooks/admin/useProcessingLogs";
import { useIsps } from "@/hooks/useIsps";

const ERROR_CODES = [
  { code: "ERR_DOC_001", label: "Documento não encontrado" },
  { code: "ERR_DOC_002", label: "Falha no download" },
  { code: "ERR_DOC_003", label: "Falha na extração" },
  { code: "ERR_DOC_004", label: "Conteúdo insuficiente" },
  { code: "ERR_CHUNK_001", label: "Erro no chunking" },
  { code: "ERR_EMBED_001", label: "Falha em embeddings" },
  { code: "ERR_EMBED_002", label: "Conteúdo não suportado" },
  { code: "ERR_DB_001", label: "Erro no banco" },
  { code: "ERR_UNKNOWN", label: "Erro desconhecido" },
];

export default function AiProcessingLogs() {
  const [selectedIsp, setSelectedIsp] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");

  const { data: logs, isLoading, refetch } = useProcessingLogs({
    ispId: selectedIsp || undefined,
    errorCode: selectedCode || undefined,
  });

  const { data: stats } = useProcessingLogStats();
  const { isps } = useIsps();

  const clearFilters = () => {
    setSelectedIsp("");
    setSelectedCode("");
  };

  const hasFilters = selectedIsp || selectedCode;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de Processamento</h1>
          <p className="text-muted-foreground">
            Visualize erros detalhados do processamento de documentos RAG
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Erros</CardDescription>
            <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Embeddings</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {(stats?.byStep?.embed || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Extração</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {(stats?.byStep?.extract || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Download</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {(stats?.byStep?.download || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Filtros</CardTitle>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <Select value={selectedIsp} onValueChange={setSelectedIsp}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por ISP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os ISPs</SelectItem>
                  {isps?.map((isp) => (
                    <SelectItem key={isp.id} value={isp.id}>
                      {isp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={selectedCode} onValueChange={setSelectedCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por código" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os códigos</SelectItem>
                  {ERROR_CODES.map((err) => (
                    <SelectItem key={err.code} value={err.code}>
                      <span className="font-mono text-xs mr-2">{err.code}</span>
                      {err.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <ProcessingLogsTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
