import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { userService } from '@/services/user';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/cases', label: 'Processos', icon: Briefcase },
  { path: '/documents', label: 'Documentos', icon: FileText },
  { path: '/calendar', label: 'Agenda', icon: Calendar },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useUser();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Sessão encerrada com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao encerrar sessão');
    }
  };

  if (loading) {
    return (
      <aside className={cn(
        "h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-sidebar-foreground/20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-sidebar-foreground/20 rounded"></div>
                <div className="h-4 bg-sidebar-foreground/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className={cn(
        "h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h1 className="text-xl font-playfair text-sidebar-foreground">JurisConnect</h1>
              )}
              <button
                onClick={toggleCollapse}
                className="p-1 rounded-md hover:bg-sidebar-foreground/10"
              >
                {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md transition-colors",
                        isActive 
                          ? "bg-legal-primary/10 text-legal-primary" 
                          : "text-sidebar-foreground hover:bg-sidebar-foreground/10"
                      )}
                    >
                      <Icon size={20} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            {!collapsed && user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-legal-secondary flex items-center justify-center text-legal-primary font-semibold">
                  {user.personal_info?.name ? userService.getInitials(user.personal_info.name) : '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.personal_info?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60 truncate">
                        {user.role ? userService.getRoleLabel(user.role) : 'Carregando...'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="p-1 rounded-md hover:bg-sidebar-foreground/10 text-sidebar-foreground/60 hover:text-sidebar-foreground ml-2"
                      title="Encerrar sessão"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {collapsed && user && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-legal-secondary flex items-center justify-center text-legal-primary font-semibold">
                  {user.personal_info?.name ? userService.getInitials(user.personal_info.name) : '??'}
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-1 rounded-md hover:bg-sidebar-foreground/10 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  title="Encerrar sessão"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Modal de Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Encerrar Sessão
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Tem certeza que deseja sair do sistema?
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
