import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import GuiaProjeto from "./pages/GuiaProjeto";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import IspsPage from "./pages/admin/Isps";
import PlansPage from "./pages/admin/Plans";
import FinancePage from "./pages/admin/Finance";
import InvoicesPage from "./pages/admin/Invoices";
import SubscriptionsPage from "./pages/admin/Subscriptions";
import UsersPage from "./pages/admin/Users";
import { PainelLayout } from "./components/painel/PainelLayout";
import PainelDashboard from "./pages/painel/Dashboard";
import PainelSubscribers from "./pages/painel/Subscribers";
import PainelTickets from "./pages/painel/Tickets";
import PainelCommunication from "./pages/painel/Communication";
import PainelUsers from "./pages/painel/Users";
import PainelReports from "./pages/painel/Reports";
import PainelSettings from "./pages/painel/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuiaProjeto />} />
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
            </Route>
            
            {/* Painel Cliente ISP Routes */}
            <Route path="/painel" element={<PainelLayout />}>
              <Route index element={<PainelDashboard />} />
              <Route path="assinantes" element={<PainelSubscribers />} />
              <Route path="atendimentos" element={<PainelTickets />} />
              <Route path="comunicacao" element={<PainelCommunication />} />
              <Route path="usuarios" element={<PainelUsers />} />
              <Route path="relatorios" element={<PainelReports />} />
              <Route path="configuracoes" element={<PainelSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
