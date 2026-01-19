import { useState } from "react";
import { MessageSquare, Filter, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  open: { label: "Aberto", variant: "destructive", icon: AlertCircle },
  in_progress: { label: "Em Andamento", variant: "secondary", icon: Clock },
  closed: { label: "Fechado", variant: "default", icon: CheckCircle2 },
};

const AdminSupportPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          isps:isp_id (name, slug),
          subscribers:subscriber_id (name, email),
          ai_agents:agent_id (name, type)
        `)
        .order("started_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Filter conversations
  const filteredConversations = conversations?.filter((conv) => {
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.isps as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const openCount = conversations?.filter((c) => c.status === "open").length || 0;
  const inProgressCount = conversations?.filter((c) => c.status === "in_progress").length || 0;
  const closedToday = conversations?.filter(
    (c) =>
      c.status === "closed" &&
      c.closed_at &&
      new Date(c.closed_at).toDateString() === new Date().toDateString()
  ).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">Gerencie tickets de suporte de todos os ISPs</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="text-muted-foreground">Gerencie tickets de suporte de todos os ISPs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tickets Abertos</CardDescription>
            <CardTitle className="text-2xl text-destructive">{openCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Em Andamento</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{inProgressCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fechados Hoje</CardDescription>
            <CardTitle className="text-2xl text-green-600">{closedToday}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Todos os Tickets
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredConversations && filteredConversations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ISP</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Iniciado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.map((conv) => {
                  const status = statusConfig[conv.status || "open"];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={conv.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {(conv.isps as any)?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conv.subject || "Sem assunto"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {conv.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(conv.ai_agents as any)?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {conv.started_at
                          ? formatDistanceToNow(new Date(conv.started_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold">Nenhum ticket encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Os tickets de suporte aparecerão aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportPage;
