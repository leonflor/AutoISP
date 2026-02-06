import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Eager load - Landing page (critical path)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load - Auth pages
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const GuiaProjeto = lazy(() => import("./pages/GuiaProjeto"));

// Lazy load - Admin pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const IspsPage = lazy(() => import("./pages/admin/Isps"));
const PlansPage = lazy(() => import("./pages/admin/Plans"));
const FinancePage = lazy(() => import("./pages/admin/Finance"));
const InvoicesPage = lazy(() => import("./pages/admin/Invoices"));
const SubscriptionsPage = lazy(() => import("./pages/admin/Subscriptions"));
const UsersPage = lazy(() => import("./pages/admin/Users"));
const AdminConfig = lazy(() => import("./pages/admin/Config"));

// Lazy load - Painel ISP pages
const PainelLayout = lazy(() => import("./components/painel/PainelLayout").then(m => ({ default: m.PainelLayout })));
const PainelDashboard = lazy(() => import("./pages/painel/Dashboard"));
const PainelSubscribers = lazy(() => import("./pages/painel/Subscribers"));
const PainelTickets = lazy(() => import("./pages/painel/Tickets"));
const PainelCommunication = lazy(() => import("./pages/painel/Communication"));
const PainelUsers = lazy(() => import("./pages/painel/Users"));
const PainelReports = lazy(() => import("./pages/painel/Reports"));
const PainelSettings = lazy(() => import("./pages/painel/Settings"));
const PainelAiAgents = lazy(() => import("./pages/painel/AiAgents"));
const PainelAgentKnowledge = lazy(() => import("./pages/painel/AiAgentKnowledge"));
const PainelInvoices = lazy(() => import("./pages/painel/Invoices"));
const PainelWhatsApp = lazy(() => import("./pages/painel/WhatsAppConfig"));
const PainelErpIntegrations = lazy(() => import("./pages/painel/ErpIntegrations"));

// Lazy load - Admin extra pages
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const SupportTickets = lazy(() => import("./pages/admin/SupportTickets"));
const AiAgentsPage = lazy(() => import("./pages/admin/AiAgents"));
const AiSecurityPage = lazy(() => import("./pages/admin/AiSecurity"));
const AiProcessingLogsPage = lazy(() => import("./pages/admin/AiProcessingLogs"));
const SupportTicketDetail = lazy(() => import("./pages/admin/SupportTicketDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/guia" element={<GuiaProjeto />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Admin SaaS Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="isps" element={<IspsPage />} />
                <Route path="planos" element={<PlansPage />} />
                <Route path="financeiro" element={<FinancePage />} />
                <Route path="faturas" element={<InvoicesPage />} />
                <Route path="assinaturas" element={<SubscriptionsPage />} />
                <Route path="usuarios" element={<UsersPage />} />
                <Route path="suporte" element={<AdminSupport />} />
                <Route path="tickets" element={<SupportTickets />} />
                <Route path="tickets/:id" element={<SupportTicketDetail />} />
                <Route path="ai-agents" element={<AiAgentsPage />} />
                <Route path="ai-logs" element={<AiProcessingLogsPage />} />
                <Route path="ai-security" element={<AiSecurityPage />} />
                <Route path="relatorios" element={<AdminReports />} />
                <Route path="config" element={<AdminConfig />} />
              </Route>
              
              {/* Painel Cliente ISP Routes */}
              <Route path="/painel" element={<PainelLayout />}>
                <Route index element={<PainelDashboard />} />
                <Route path="assinantes" element={<PainelSubscribers />} />
                <Route path="atendimentos" element={<PainelTickets />} />
                <Route path="whatsapp" element={<PainelWhatsApp />} />
                <Route path="comunicacao" element={<PainelCommunication />} />
                <Route path="usuarios" element={<PainelUsers />} />
                <Route path="agentes" element={<PainelAiAgents />} />
                <Route path="agentes/:agentId/conhecimento" element={<PainelAgentKnowledge />} />
                <Route path="faturas" element={<PainelInvoices />} />
                <Route path="relatorios" element={<PainelReports />} />
                <Route path="configuracoes" element={<PainelSettings />} />
                <Route path="integracoes/erp" element={<PainelErpIntegrations />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;