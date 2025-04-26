
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  Clock,
  MoreHorizontal,
  Filter,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Mock data for cases
const casesData = [
  {
    id: "1",
    number: "0001234-55.2025.8.26.0100",
    title: "Silva vs Tech Corp",
    client: "João Silva",
    type: "Trabalhista",
    status: "Em Andamento",
    nextDeadline: "28/04/2025",
    responsibleAttorney: "Dr. Pedro Almeida",
  },
  {
    id: "2",
    number: "0002345-66.2025.8.26.0100",
    title: "Pereira vs Banco Nacional",
    client: "Maria Pereira",
    type: "Cível",
    status: "Aguardando Audiência",
    nextDeadline: "15/05/2025",
    responsibleAttorney: "Dra. Ana Costa",
  },
  {
    id: "3",
    number: "0003456-77.2025.8.26.0100",
    title: "Tech Solutions vs Fornecedor X",
    client: "Tech Solutions Ltda",
    type: "Empresarial",
    status: "Concluído",
    nextDeadline: "Finalizado",
    responsibleAttorney: "Dr. Marcelo Santos",
  },
  {
    id: "4",
    number: "0004567-88.2025.8.26.0100",
    title: "Disputa Imobiliária",
    client: "Imobiliária Central",
    type: "Imobiliário",
    status: "Novo",
    nextDeadline: "10/05/2025",
    responsibleAttorney: "Dr. Pedro Almeida",
  },
];

// Group cases by status for Kanban view
const casesGroupedByStatus = {
  "Novo": casesData.filter((c) => c.status === "Novo"),
  "Em Andamento": casesData.filter((c) => c.status === "Em Andamento"),
  "Aguardando Audiência": casesData.filter((c) => c.status === "Aguardando Audiência"),
  "Concluído": casesData.filter((c) => c.status === "Concluído"),
};

export default function Cases() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter cases based on search term
  const filteredCases = casesData.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.number.includes(searchTerm)
  );

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo": return "bg-blue-100 text-blue-800";
      case "Em Andamento": return "bg-yellow-100 text-yellow-800";
      case "Aguardando Audiência": return "bg-purple-100 text-purple-800";
      case "Concluído": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-legal-primary" />
          <h1 className="text-2xl font-bold">Casos</h1>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar por título, cliente ou número do processo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título/Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Próximo Prazo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.length > 0 ? (
                      filteredCases.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{c.title}</div>
                              <div className="text-sm text-gray-500">{c.number}</div>
                            </div>
                          </TableCell>
                          <TableCell>{c.client}</TableCell>
                          <TableCell>{c.type}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {c.nextDeadline}
                          </TableCell>
                          <TableCell>{c.responsibleAttorney}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                <DropdownMenuItem>Editar caso</DropdownMenuItem>
                                <DropdownMenuItem>Adicionar prazo</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Arquivar caso</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                          Nenhum caso encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {Object.entries(casesGroupedByStatus).map(([status, cases]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">{status}</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                    {cases.length}
                  </span>
                </div>
                
                <div className="space-y-3 min-h-[200px]">
                  {cases.map((c) => (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{c.title}</CardTitle>
                        <CardDescription className="text-xs">{c.number}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-sm mb-2">Cliente: <span className="font-medium">{c.client}</span></div>
                        <div className="text-sm mb-3">Tipo: <span className="font-medium">{c.type}</span></div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {c.nextDeadline}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.responsibleAttorney}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
