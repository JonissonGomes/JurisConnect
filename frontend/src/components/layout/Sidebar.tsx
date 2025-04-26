
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  BarChart2, 
  Settings,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  isCollapsed?: boolean;
};

const NavItem = ({ icon, label, to, isActive, isCollapsed = false }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      )}
    >
      <div>{icon}</div>
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, to: '/' },
    { label: 'Clientes', icon: <Users size={20} />, to: '/clientes' },
    { label: 'Casos', icon: <FileText size={20} />, to: '/casos' },
    { label: 'Prazos', icon: <Calendar size={20} />, to: '/prazos' },
    { label: 'Faturamento', icon: <DollarSign size={20} />, to: '/faturamento' },
    { label: 'Comunicações', icon: <MessageSquare size={20} />, to: '/comunicacoes' },
    { label: 'Relatórios', icon: <BarChart2 size={20} />, to: '/relatorios' },
    { label: 'Configurações', icon: <Settings size={20} />, to: '/configuracoes' }
  ];

  return (
    <div 
      className={cn(
        'h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <h1 className="font-playfair text-sidebar-foreground text-xl font-bold">Advo<span className="text-legal-secondary">Nexus</span></h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={location.pathname === item.to}
            isCollapsed={collapsed}
          />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-legal-secondary flex items-center justify-center text-legal-primary font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Advogado</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-legal-secondary flex items-center justify-center text-legal-primary font-semibold">
              JD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
