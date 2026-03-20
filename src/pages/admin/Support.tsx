import { useState } from "react";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User, Bot, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const modeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  bot: { label: "Bot", variant: "secondary", icon: Bot },
  human: { label: "Humano", variant: "destructive", icon: UserCheck },
  paused: { label: "Pausado", variant: "outline", icon: Clock },
  resolved: { label: "Resolvido", variant: "default", icon: CheckCircle2 },
};

function getConversationStatus(conv: { mode: string; resolved_at: string | null }) {
  if (conv.resolved_at) return "resolved";
  return conv.mode;
}

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
          tenant_agents:tenant_agent_id (custom_name, template_id)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const filteredConversations = conversations?.filter((conv) => {
    const convStatus = getConversationStatus(conv);
    const matchesStatus = statusFilter === "all" || convStatus === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      conv.user_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.isps as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = conversations?.filter((c) => !c.resolved_at).length || 0;
  const humanCount = conversations?.filter((c) => c.mode === "human" && !c.resolved_at).length || 0;
  const resolvedToday = conversations?.filter(
    (c) =>
      c.resolved_at &&
      new Date(c.resolved_at).toDateString() === new Date().toDateString()
  ).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">Gerencie conversas de suporte de todos os ISPs</p>
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
        <p className="text-muted-foreground">Gerencie conversas de suporte de todos os ISPs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversas Ativas</CardDescription>
            <CardTitle className="text-2xl text-destructive">{activeCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Atendimento Humano</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{humanCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolvidos Hoje</CardDescription>
            <CardTitle className="text-2xl text-green-600">{resolvedToday}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Todas as Conversas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar por telefone ou ISP..."
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
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="human">Humano</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
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
                  <TableHead>Telefone</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Iniciado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.map((conv) => {
                  const convStatus = getConversationStatus(conv);
                  const config = modeConfig[convStatus] || modeConfig.bot;
                  const StatusIcon = config.icon;
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
                      <TableCell>{conv.user_phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {conv.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(conv.tenant_agents as any)?.custom_name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {conv.created_at
                          ? formatDistanceToNow(new Date(conv.created_at), {
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
              <h3 className="font-semibold">Nenhuma conversa encontrada</h3>
              <p className="text-sm text-muted-foreground">
                As conversas de suporte aparecerão aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportPage;
