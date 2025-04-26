
import { CheckSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: "alta" | "media" | "baixa";
  status: "pendente" | "concluida";
  caseId?: string;
  caseName?: string;
};

type TaskListProps = {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
};

export function TaskList({ tasks, onTaskComplete }: TaskListProps) {
  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta': return 'text-red-600';
      case 'media': return 'text-orange-600';
      case 'baixa': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatPriority = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Não definida';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium">Tarefas Pendentes</h3>
        <Button variant="outline" size="sm">Ver todas</Button>
      </div>
      <div className="divide-y">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className={cn(
              "p-4 hover:bg-gray-50 transition-colors flex items-center justify-between",
              task.status === 'concluida' && "bg-gray-50"
            )}>
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1 h-auto w-auto"
                  onClick={() => onTaskComplete?.(task.id)}
                >
                  <CheckSquare 
                    className={cn(
                      "h-5 w-5", 
                      task.status === 'concluida' ? "text-green-500" : "text-gray-400"
                    )} 
                  />
                </Button>
                <div>
                  <p className={cn(
                    "font-medium",
                    task.status === 'concluida' && "line-through text-gray-500"
                  )}>
                    {task.title}
                  </p>
                  {task.caseName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Caso: {task.caseName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="text-sm">{task.dueDate}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1",
                  getPriorityClass(task.priority)
                )}>
                  {formatPriority(task.priority)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Nenhuma tarefa pendente
          </div>
        )}
      </div>
    </div>
  );
}
