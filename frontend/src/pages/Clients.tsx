
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Users,
  UserPlus,
  FileText,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock client data
const clientsData = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    type: "Pessoa Física",
    status: "Ativo",
    cases: 3,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    phone: "(11) 91234-5678",
    type: "Pessoa Física",
    status: "Ativo",
    cases: 1,
  },
  {
    id: "3",
    name: "Tech Solutions Ltda",
    email: "contato@techsolutions.com",
    phone: "(11) 3456-7890",
    type: "Pessoa Jurídica",
    status: "Ativo",
    cases: 2,
  },
  {
    id: "4",
    name: "Carlos Mendes",
    email: "carlos.mendes@email.com",
    phone: "(21) 99876-5432",
    type: "Pessoa Física",
    status: "Inativo",
    cases: 0,
  },
  {
    id: "5",
    name: "Imobiliária Central",
    email: "contato@imobiliariacentral.com",
    phone: "(11) 2345-6789",
    type: "Pessoa Jurídica",
    status: "Ativo",
    cases: 5,
  },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter clients based on search term and status
  const filteredClients = clientsData.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesStatus =
      statusFilter === "todos" || client.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    setIsDialogOpen(false);
    toast({
      title: "Cliente adicionado com sucesso",
      description: "O novo cliente foi cadastrado no sistema.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-legal-primary" />
          <h1 className="text-2xl font-bold">Clientes</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo cliente no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome completo / Razão social
                </label>
                <Input id="name" placeholder="Digite o nome completo" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Tipo
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="cpf" className="text-sm font-medium">
                  CPF / CNPJ
                </label>
                <Input id="cpf" placeholder="Digite o CPF ou CNPJ" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input id="email" type="email" placeholder="Digite o e-mail" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input id="phone" placeholder="(00) 00000-0000" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Endereço
                </label>
                <Input id="address" placeholder="Digite o endereço" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddClient}>
                Adicionar Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Casos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.type}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === "Ativo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell>{client.cases}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar e-mail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Ligar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Excluir cliente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
