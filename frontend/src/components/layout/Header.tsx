
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4 bg-white">
      <div className="w-72 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Buscar clientes, casos ou prazos..." 
          className="pl-10 bg-gray-50 border-gray-200" 
        />
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">
                5
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <DropdownMenuLabel className="text-sm font-medium p-3 border-b">
              Notificações
            </DropdownMenuLabel>
            <div className="max-h-[400px] overflow-y-auto">
              <NotificationItem 
                title="Prazo se aproximando" 
                message="Audiência Caso Silva vs Tech Corp em 2 dias" 
                time="1h atrás" 
                type="warning"
              />
              <NotificationItem 
                title="Documento adicionado" 
                message="Nova petição enviada no caso João Mendes" 
                time="3h atrás" 
                type="info"
              />
              <NotificationItem 
                title="Pagamento recebido" 
                message="Pagamento de R$ 3.500 recebido do cliente Maria Santos" 
                time="5h atrás" 
                type="success"
              />
              <NotificationItem 
                title="Prazo vencido" 
                message="Prazo para resposta no caso Oliveira expirou" 
                time="1 dia atrás" 
                type="danger"
              />
              <NotificationItem 
                title="Nova mensagem" 
                message="Carlos Lima enviou uma mensagem" 
                time="1 dia atrás" 
                type="info"
              />
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm justify-center">
                Ver todas as notificações
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon">
          <HelpCircle size={20} />
        </Button>
      </div>
    </header>
  );
}

type NotificationItemProps = {
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "danger";
};

function NotificationItem({ title, message, time, type }: NotificationItemProps) {
  const getBgColor = () => {
    switch (type) {
      case "info": return "bg-blue-500";
      case "success": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "danger": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DropdownMenuItem className="py-3 px-4 cursor-pointer focus:bg-gray-50" asChild>
      <div className="flex gap-3 items-start">
        <div className={`w-2 h-2 ${getBgColor()} rounded-full mt-1.5`}></div>
        <div className="flex-1">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
