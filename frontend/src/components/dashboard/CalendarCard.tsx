
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { cn } from '@/lib/utils';

type Event = {
  id: string;
  title: string;
  date: Date;
  type: "audiencia" | "prazo" | "reuniao";
};

type CalendarCardProps = {
  events: Event[];
};

export function CalendarCard({ events }: CalendarCardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const getTodaysEvents = () => {
    if (!date) return [];
    return eventsByDate[date.toDateString()] || [];
  };

  const getEventClassName = (type: Event['type']) => {
    switch (type) {
      case 'audiencia': return 'bg-legal-primary text-white';
      case 'prazo': return 'bg-red-500 text-white';
      case 'reuniao': return 'bg-legal-secondary text-legal-primary';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium">Calendário</h3>
        <Button variant="outline" size="sm">Novo evento</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-3 pointer-events-auto"
            modifiers={{
              booked: (date) => {
                return Boolean(eventsByDate[date.toDateString()]);
              },
            }}
            modifiersStyles={{
              booked: { color: '#EF4444' }
            }}
          />
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">
            {date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date) : 'Selecione uma data'}
          </h4>
          <div className="space-y-2 mt-3">
            {getTodaysEvents().length > 0 ? (
              getTodaysEvents().map((event) => (
                <div key={event.id} className={cn(
                  "p-3 rounded-md",
                  getEventClassName(event.type)
                )}>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm opacity-80">
                    {new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(event.date)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum evento nesta data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
