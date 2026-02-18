import { useState } from 'react';
import { LayoutDashboard, Building2, Package, Users, Settings, LogOut, DollarSign, FileText, CreditCard, ChevronDown, MessageSquare, BarChart3, Bot, Shield, FileWarning, Wrench, GitBranch } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type MenuItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  submenu?: { title: string; url: string; icon: React.ElementType }[];
};

const menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'ISPs', url: '/admin/isps', icon: Building2 },
  { title: 'Planos', url: '/admin/planos', icon: Package },
  { 
    title: 'Financeiro', 
    icon: DollarSign,
    submenu: [
      { title: 'Visão Geral', url: '/admin/financeiro', icon: DollarSign },
      { title: 'Faturas', url: '/admin/faturas', icon: FileText },
      { title: 'Assinaturas', url: '/admin/assinaturas', icon: CreditCard },
    ]
  },
  { title: 'Usuários', url: '/admin/usuarios', icon: Users },
  { 
    title: 'Suporte', 
    icon: MessageSquare,
    submenu: [
      { title: 'Tickets ISPs', url: '/admin/tickets', icon: MessageSquare },
      { title: 'Conversas', url: '/admin/suporte', icon: MessageSquare },
    ]
  },
  { 
    title: 'IA', 
    icon: Bot,
    submenu: [
      { title: 'Templates de Agentes', url: '/admin/ai-agents', icon: Bot },
      { title: 'Ferramentas', url: '/admin/ai-tools', icon: Wrench },
      { title: 'Fluxos', url: '/admin/ai-flows', icon: GitBranch },
      { title: 'Logs de Processamento', url: '/admin/ai-logs', icon: FileWarning },
      { title: 'Cláusulas LGPD', url: '/admin/ai-security', icon: Shield },
    ]
  },
  { title: 'Relatórios', url: '/admin/relatorios', icon: BarChart3 },
  { title: 'Configurações', url: '/admin/config', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: { url: string }[]) => {
    return submenu.some(item => location.pathname === item.url);
  };

  // State for each submenu
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.submenu) {
        initial[item.title] = isSubmenuActive(item.submenu);
      }
    });
    return initial;
  });

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.submenu) {
      const isActive = isSubmenuActive(item.submenu);
      const isOpen = openSubmenus[item.title] || isActive;
      
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleSubmenu(item.title)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.title}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted w-full justify-between",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )} />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {!collapsed && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {item.submenu.map((subitem) => (
                    <NavLink
                      key={subitem.url}
                      to={subitem.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <subitem.icon className="h-4 w-4 shrink-0" />
                      <span>{subitem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.url!}
            end={item.url === '/admin'}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg text-primary">AutoISP Admin</span>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
