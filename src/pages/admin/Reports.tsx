import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Bot, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#22c55e", "#eab308", "#ef4444"];

const AdminReportsPage = () => {
  const [period, setPeriod] = useState("6");

  // Fetch ISPs count
  const { data: ispsData, isLoading: ispsLoading } = useQuery({
    queryKey: ["admin-isps-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("isps")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch subscriptions data
  const { data: subscriptionsData, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscriptions-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, plan_id, created_at");

      if (error) throw error;
      return data;
    },
  });

  // Fetch invoices for revenue
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["admin-invoices-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("amount, status, created_at, paid_at")
        .eq("status", "pago");

      if (error) throw error;
      return data;
    },
  });

  // Fetch AI usage
  const { data: aiUsageData, isLoading: aiLoading } = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage")
        .select("tokens_total, cost_usd, created_at");

      if (error) throw error;
      return data;
    },
  });

  const isLoading = ispsLoading || subsLoading || invoicesLoading || aiLoading;

  // Calculate metrics
  const totalRevenue = invoicesData?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;
  const activeSubscriptions = subscriptionsData?.filter((s) => s.status === "ativa").length || 0;
  const trialSubscriptions = subscriptionsData?.filter((s) => s.status === "trial").length || 0;
  const totalTokens = aiUsageData?.reduce((acc, u) => acc + (u.tokens_total || 0), 0) || 0;
  const totalAiCost = aiUsageData?.reduce((acc, u) => acc + Number(u.cost_usd || 0), 0) || 0;

  // Generate monthly revenue data for chart
  const generateMonthlyData = () => {
    const months = parseInt(period);
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthRevenue = invoicesData
        ?.filter((inv) => {
          const paidDate = inv.paid_at ? new Date(inv.paid_at) : null;
          return paidDate && paidDate >= start && paidDate <= end;
        })
        .reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;

      const monthTokens = aiUsageData
        ?.filter((u) => {
          const createdDate = u.created_at ? new Date(u.created_at) : null;
          return createdDate && createdDate >= start && createdDate <= end;
        })
        .reduce((acc, u) => acc + (u.tokens_total || 0), 0) || 0;

      data.push({
        month: format(date, "MMM", { locale: ptBR }),
        revenue: monthRevenue,
        tokens: monthTokens,
      });
    }

    return data;
  };

  // Subscription status distribution
  const statusDistribution = [
    { name: "Ativas", value: activeSubscriptions, color: "#22c55e" },
    { name: "Trial", value: trialSubscriptions, color: "#3b82f6" },
    {
      name: "Suspensas",
      value: subscriptionsData?.filter((s) => s.status === "suspensa").length || 0,
      color: "#eab308",
    },
    {
      name: "Canceladas",
      value: subscriptionsData?.filter((s) => s.status === "cancelada").length || 0,
      color: "#ef4444",
    },
  ];

  const monthlyData = generateMonthlyData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análises e métricas da plataforma</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análises e métricas da plataforma</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total ISPs</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ispsData}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscriptions} com assinatura ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Receita Total</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Faturas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Tokens IA Usados</CardDescription>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalTokens / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Custo: ${totalAiCost.toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Trials Ativos</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Potenciais conversões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Evolução da receita nos últimos {period} meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Receita"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Assinaturas</CardTitle>
            <CardDescription>Por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Usage Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Uso de IA</CardTitle>
            <CardDescription>Tokens consumidos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) =>
                    `${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    `${value.toLocaleString()} tokens`
                  }
                />
                <Bar
                  dataKey="tokens"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Tokens"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;
