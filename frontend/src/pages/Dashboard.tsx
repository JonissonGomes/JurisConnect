
import { 
  Users, 
  FileText, 
  Clock, 
  DollarSign,
  AlertCircle
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { CaseStatusChart } from "@/components/dashboard/CasesStatusChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  // Mock data for demonstration
  const tasks = [
    { 
      id: "1", 
      title: "Preparar defesa para caso Silva vs Tech Corp", 
      dueDate: "Hoje, 14:00", 
      priority: "alta", 
      status: "pendente",
      caseName: "Silva vs Tech Corp" 
    },
    { 
      id: "2", 
      title: "Enviar notificação extrajudicial para inquilino", 
      dueDate: "Amanhã", 
      priority: "media", 
      status: "pendente",
      caseName: "Imobiliária Central" 
    },
    { 
      id: "3", 
      title: "Revisar contrato de parceria", 
      dueDate: "23/05/2025", 
      priority: "baixa", 
      status: "pendente" 
    },
    { 
      id: "4", 
      title: "Audiência preliminar", 
      dueDate: "24/05/2025", 
      priority: "alta", 
      status: "pendente",
      caseName: "Pereira vs Banco Nacional" 
    },
  ] as const;

  const events = [
    {
      id: "1",
      title: "Audiência - Silva vs Tech Corp",
      date: new Date(2025, 3, 28, 14, 0),
      type: "audiencia"
    },
    {
      id: "2",
      title: "Prazo - Recurso Banco Nacional",
      date: new Date(2025, 3, 26, 18, 0),
      type: "prazo"
    },
    {
      id: "3",
      title: "Reunião com cliente - João Pereira",
      date: new Date(2025, 3, 29, 10, 30),
      type: "reuniao"
    },
    {
      id: "4",
      title: "Prazo - Contestação Santos vs Distribuidora",
      date: new Date(2025, 3, 30, 18, 0),
      type: "prazo"
    },
  ] as const;

  const caseStatusData = [
    { name: "Em andamento", quantidade: 35, cor: "#1A365D" },
    { name: "Aguardando", quantidade: 12, cor: "#ECBE7A" },
    { name: "Concluídos", quantidade: 20, cor: "#10B981" },
    { name: "Arquivados", quantidade: 8, cor: "#6B7280" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>Nova Tarefa</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Clientes Ativos" 
          value="45" 
          icon={<Users size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Casos Ativos" 
          value="28" 
          icon={<FileText size={20} />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard 
          title="Prazos Próximos" 
          value="8" 
          icon={<Clock size={20} />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatsCard 
          title="Faturamento Mensal" 
          value="R$ 58.500" 
          icon={<DollarSign size={20} />}
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="atividades">
        <TabsList>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="casos">Casos</TabsTrigger>
        </TabsList>
        <TabsContent value="atividades" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskList tasks={tasks} />
          <CalendarCard events={events} />
        </TabsContent>
        <TabsContent value="casos" className="mt-6">
          <CaseStatusChart data={caseStatusData} />
        </TabsContent>
      </Tabs>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center gap-3">
        <div className="rounded-full bg-yellow-100 p-2 text-yellow-700">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="font-medium text-yellow-800">Atenção</h4>
          <p className="text-sm text-yellow-700">Existem 3 prazos importantes vencendo nas próximas 48 horas. Verifique a seção de Prazos.</p>
        </div>
      </div>
    </div>
  );
}
