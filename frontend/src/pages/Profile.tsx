import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { userService } from "@/services/user";
import { toast } from "sonner";
import { User, Upload, Save, Edit, X, Check, Camera } from "lucide-react";
import { masks } from "@/lib/validations";
import { searchCEP } from "@/services/cep";

interface ProfessionalInfoState {
  oab_number?: string;
  oab_state?: string;
  department: string;
  specialties: string[];
  hire_date: string;
  supervisor_id: string;
}

interface UserData {
  id: string;
  personal_info: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    birth_date: string;
    profile_image: string;
    address: {
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
    };
  };
  professional_info: ProfessionalInfoState;
  role: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    birth_date: "",
    profile_image: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfoState>({
    oab_number: "",
    oab_state: "",
    department: "",
    specialties: [],
    hire_date: "",
    supervisor_id: "",
  });

  // Estados brasileiros para o select
  const estados = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  // Carregar dados do usuário quando o componente for montado
  useEffect(() => {
    if (user) {
      // Formatar datas para exibição
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      setPersonalInfo({
        name: user.personal_info.name || "",
        email: user.personal_info.email || "",
        phone: user.personal_info.phone || "",
        cpf: user.personal_info.cpf || "",
        rg: user.personal_info.rg || "",
        birth_date: user.personal_info.birth_date ? formatDate(user.personal_info.birth_date) : "",
        profile_image: user.personal_info.profile_image || "",
        address: {
          street: user.personal_info.address.street || "",
          number: user.personal_info.address.number || "",
          complement: user.personal_info.address.complement || "",
          neighborhood: user.personal_info.address.neighborhood || "",
          city: user.personal_info.address.city || "",
          state: user.personal_info.address.state || "",
          zip_code: user.personal_info.address.zip_code || "",
        },
      });

      setProfessionalInfo({
        oab_number: user.professional_info.oab_number || "",
        oab_state: user.professional_info.oab_state || "",
        department: user.professional_info.department || "",
        specialties: user.professional_info.specialties || [],
        hire_date: user.professional_info.hire_date ? formatDate(user.professional_info.hire_date) : "",
        supervisor_id: user.professional_info.supervisor_id || "",
      });
    }
  }, [user]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "address") {
        let maskedValue = value;
        
        // Aplicar máscara para o CEP
        if (child === "zip_code") {
          maskedValue = masks.cep(value);
        }
        
        setPersonalInfo((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: maskedValue,
          },
        }));
      }
    } else {
      let maskedValue = value;
      
      // Aplicar máscaras
      if (name === "phone") {
        maskedValue = masks.phone(value);
      } else if (name === "cpf") {
        maskedValue = masks.cpf(value);
      } else if (name === "rg") {
        maskedValue = masks.rg(value);
      } else if (name === "birth_date") {
        // Permite apagar caracteres
        if (value.length < personalInfo.birth_date.length) {
          setPersonalInfo(prev => ({
            ...prev,
            birth_date: value
          }));
          return;
        }

        // Limita o tamanho máximo
        if (value.length > 10) return;

        // Aplica a máscara
        let maskedValue = value.replace(/\D/g, '');
        
        if (maskedValue.length <= 2) {
          maskedValue = maskedValue;
        } else if (maskedValue.length <= 4) {
          maskedValue = `${maskedValue.slice(0, 2)}/${maskedValue.slice(2)}`;
        } else {
          maskedValue = `${maskedValue.slice(0, 2)}/${maskedValue.slice(2, 4)}/${maskedValue.slice(4, 8)}`;
        }

        setPersonalInfo(prev => ({
          ...prev,
          birth_date: maskedValue
        }));
        return;
      }
      
      setPersonalInfo((prev) => ({
        ...prev,
        [name]: maskedValue,
      }));
    }
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "hire_date") {
      // Permite apagar caracteres
      if (value.length < professionalInfo.hire_date.length) {
        setProfessionalInfo(prev => ({
          ...prev,
          hire_date: value
        }));
        return;
      }

      // Limita o tamanho máximo
      if (value.length > 10) return;

      // Aplica a máscara
      let maskedValue = value.replace(/\D/g, '');
      
      if (maskedValue.length <= 2) {
        maskedValue = maskedValue;
      } else if (maskedValue.length <= 4) {
        maskedValue = `${maskedValue.slice(0, 2)}/${maskedValue.slice(2)}`;
      } else {
        maskedValue = `${maskedValue.slice(0, 2)}/${maskedValue.slice(2, 4)}/${maskedValue.slice(4, 8)}`;
      }

      setProfessionalInfo(prev => ({
        ...prev,
        hire_date: maskedValue
      }));
    } else {
      setProfessionalInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    if (fieldName.includes(".")) {
      const [parent, child] = fieldName.split(".");
      if (parent === "address") {
        setPersonalInfo((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value,
          },
        }));
      } else if (parent === "professional") {
        setProfessionalInfo((prev) => ({
          ...prev,
          [child]: value,
        }));
      }
    }
  };

  const handleSavePersonalInfo = async () => {
    try {
      setIsLoading(true);
      
      // Formatar datas para o formato DD/MM/AAAA
      const formattedBirthDate = personalInfo.birth_date
        ? personalInfo.birth_date // Já está no formato DD/MM/AAAA
        : '';

      const formattedHireDate = professionalInfo.hire_date
        ? professionalInfo.hire_date // Já está no formato DD/MM/AAAA
        : '';

      // Criar o payload com todos os campos atualizados
      const dataToUpdate = {
        personal_info: {
          name: personalInfo.name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          cpf: personalInfo.cpf,
          rg: personalInfo.rg,
          birth_date: formattedBirthDate,
          address: {
            street: personalInfo.address.street,
            number: personalInfo.address.number,
            complement: personalInfo.address.complement,
            neighborhood: personalInfo.address.neighborhood,
            city: personalInfo.address.city,
            state: personalInfo.address.state,
            zip_code: personalInfo.address.zip_code
          }
        },
        professional_info: {
          oab_number: professionalInfo.oab_number,
          oab_state: professionalInfo.oab_state,
          department: professionalInfo.department,
          specialties: professionalInfo.specialties,
          hire_date: formattedHireDate,
          supervisor_id: professionalInfo.supervisor_id
        }
      };

      // Log do payload antes de enviar
      console.log('Payload para atualização:', JSON.stringify(dataToUpdate, null, 2));

      // Atualizar usuário no backend
      await userService.updateUser(dataToUpdate);
      
      // Atualizar o contexto do usuário
      await refreshUser();
      
      toast.success("Informações atualizadas com sucesso!", {
        description: "Suas informações pessoais foram salvas e atualizadas no sistema.",
        duration: 5000,
        position: "top-center",
        style: {
          background: "var(--legal-primary)",
          color: "white",
          border: "none",
          fontSize: "14px",
        },
      });
      
      setIsEditingPersonal(false);
    } catch (error) {
      toast.error("Erro ao atualizar informações", {
        description: "Ocorreu um erro ao tentar salvar suas informações. Por favor, tente novamente.",
        duration: 5000,
        position: "top-center",
        style: {
          background: "var(--destructive)",
          color: "white",
          border: "none",
          fontSize: "14px",
        },
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfessionalInfo = async () => {
    try {
      setIsLoading(true);
      
      // Formatar datas para o formato DD/MM/AAAA
      const formattedHireDate = professionalInfo.hire_date
        ? professionalInfo.hire_date // Já está no formato DD/MM/AAAA
        : '';

      const dataToUpdate: Partial<UserData> = {
        professional_info: {
          ...professionalInfo,
          hire_date: formattedHireDate
        }
      };

      // Se houver alterações nas informações pessoais, incluir no payload
      if (isEditingPersonal) {
        dataToUpdate.personal_info = {
          ...personalInfo,
          // Remover profile_image se for uma string vazia para manter compatibilidade
          profile_image: personalInfo.profile_image || undefined
        };
      }

      // Atualizar usuário no backend
      await userService.updateUser(dataToUpdate);
      
      // Atualizar o contexto do usuário
      await refreshUser();
      
      toast.success("Informações atualizadas com sucesso!", {
        description: "Suas informações profissionais foram salvas e atualizadas no sistema.",
        duration: 5000,
        position: "top-center",
        style: {
          background: "var(--legal-primary)",
          color: "white",
          border: "none",
          fontSize: "14px",
        },
      });
      
      setIsEditingPersonal(false);
      setIsEditingProfessional(false);
    } catch (error) {
      toast.error("Erro ao atualizar informações", {
        description: "Ocorreu um erro ao tentar salvar suas informações. Por favor, tente novamente.",
        duration: 5000,
        position: "top-center",
        style: {
          background: "var(--destructive)",
          color: "white",
          border: "none",
          fontSize: "14px",
        },
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const imageUrl = await userService.updateProfileImage(file);
      
      // Atualiza o estado local e o objeto do usuário
      setPersonalInfo(prev => ({
        ...prev,
        profile_image: imageUrl
      }));
      
      await refreshUser();
      toast.success("Imagem de perfil atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar imagem de perfil");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const maskedValue = masks.cep(value);
    
    // Atualiza o valor do CEP
    setPersonalInfo(prev => ({
      ...prev,
      address: {
        ...prev.address,
        zip_code: maskedValue
      }
    }));
    
    // Se o CEP estiver completo (8 dígitos), faz a consulta
    if (value.replace(/\D/g, '').length === 8) {
      const cepData = await searchCEP(value);
      
      if (cepData) {
        setPersonalInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: cepData.logradouro,
            neighborhood: cepData.bairro,
            city: cepData.localidade,
            state: cepData.uf,
            complement: cepData.complemento
          }
        }));

        toast.success("Endereço encontrado!", {
          description: "Os dados do endereço foram preenchidos automaticamente.",
          duration: 3000,
          position: "top-center",
          style: {
            background: "var(--legal-primary)",
            color: "white",
            border: "none",
            fontSize: "14px",
          },
        });
      } else {
        toast.error("CEP não encontrado", {
          description: "O CEP informado não foi encontrado. Por favor, verifique e tente novamente.",
          duration: 3000,
          position: "top-center",
          style: {
            background: "var(--destructive)",
            color: "white",
            border: "none",
            fontSize: "14px",
          },
        });
      }
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={24} className="text-legal-primary" />
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="professional">Informações Profissionais</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
                <Button
                  variant={isEditingPersonal ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                >
                  {isEditingPersonal ? (
                    <>
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Gerencie suas informações pessoais e como elas aparecem no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-2 border-legal-primary/20">
                      <AvatarImage 
                        src={personalInfo.profile_image} 
                        alt={personalInfo.name} 
                      />
                      <AvatarFallback className="text-3xl bg-legal-secondary text-legal-primary font-medium">
                        {userService.getInitials(personalInfo.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditingPersonal && (
                      <label 
                        htmlFor="profile-image" 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="flex flex-col items-center text-white">
                          <Camera className="h-8 w-8 mb-1" />
                          <span className="text-xs">Alterar</span>
                        </div>
                        <input 
                          type="file" 
                          id="profile-image" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isEditingPersonal ? "Clique na imagem para alterar" : "Foto de perfil"}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      name="birth_date"
                      value={personalInfo.birth_date}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={personalInfo.cpf}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      name="rg"
                      value={personalInfo.rg}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      name="address.zip_code"
                      value={personalInfo.address.zip_code}
                      onChange={handleCEPChange}
                      disabled={!isEditingPersonal || isLoading}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      name="address.street"
                      value={personalInfo.address.street}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      name="address.number"
                      value={personalInfo.address.number}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      name="address.complement"
                      value={personalInfo.address.complement}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="address.neighborhood"
                      value={personalInfo.address.neighborhood}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="address.city"
                      value={personalInfo.address.city}
                      onChange={handlePersonalChange}
                      disabled={!isEditingPersonal || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select
                      value={personalInfo.address.state}
                      onValueChange={(value) => handleSelectChange(value, "address.state")}
                      disabled={!isEditingPersonal || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isEditingPersonal && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Restaurar dados originais
                      if (user) {
                        setPersonalInfo({
                          ...user.personal_info,
                          profile_image: user.personal_info.profile_image || ""
                        });
                      }
                      setIsEditingPersonal(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSavePersonalInfo}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Salvando..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="mt-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Informações Profissionais</CardTitle>
                <Button
                  variant={isEditingProfessional ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setIsEditingProfessional(!isEditingProfessional)}
                >
                  {isEditingProfessional ? (
                    <>
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Gerencie suas informações profissionais, como OAB e departamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oab_number">Número da OAB</Label>
                  <Input
                    id="oab_number"
                    name="oab_number"
                    value={professionalInfo.oab_number}
                    onChange={handleProfessionalChange}
                    disabled={!isEditingProfessional || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab_state">Estado da OAB</Label>
                  <Select
                    value={professionalInfo.oab_state}
                    onValueChange={(value) => handleSelectChange(value, "professional.oab_state")}
                    disabled={!isEditingProfessional || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    name="department"
                    value={professionalInfo.department}
                    onChange={handleProfessionalChange}
                    disabled={!isEditingProfessional || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Data de Contratação</Label>
                  <Input
                    id="hire_date"
                    name="hire_date"
                    value={professionalInfo.hire_date}
                    onChange={handleProfessionalChange}
                    disabled={!isEditingProfessional || isLoading}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>

              {isEditingProfessional && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Restaurar dados originais
                      if (user) {
                        setProfessionalInfo({
                          ...user.professional_info,
                          supervisor_id: user.professional_info.supervisor_id || ""
                        });
                      }
                      setIsEditingProfessional(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveProfessionalInfo}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Salvando..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 