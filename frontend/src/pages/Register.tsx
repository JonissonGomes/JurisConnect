import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { masks, validations, errorMessages } from "@/lib/validations";
import { authService } from "@/services/auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Loader2, User, Briefcase, MapPin } from 'lucide-react';
import { searchCEP } from "@/services/cep";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const specialties = [
  "Direito Civil",
  "Direito Trabalhista",
  "Direito Penal",
  "Direito Tributário",
  "Direito Empresarial",
  "Direito do Consumidor",
  "Direito Previdenciário",
  "Direito Ambiental",
  "Direito Digital",
  "Direito Internacional"
];

const estadosBrasileiros = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

export default function Register() {
  const [formData, setFormData] = useState({
      personal_info: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        rg: "",
        birth_date: "",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: "",
      }
      },
      professional_info: {
        oab_number: "",
        oab_state: "",
      specialties: [] as string[],
      hire_date: "",
        department: "",
        supervisor_id: "",
      },
      role: "lawyer",
      password: "",
    confirmPassword: "",
    terms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasMinLength: password.length >= 8
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let maskedValue = value;

    // Aplicar máscaras em tempo real
    if (name.includes('phone')) {
      maskedValue = masks.phone(value);
    } else if (name.includes('cpf')) {
      maskedValue = masks.cpf(value);
    } else if (name.includes('rg')) {
      maskedValue = masks.rg(value);
    } else if (name.includes('zip_code')) {
      maskedValue = masks.cep(value);
    } else if (name.includes('birth_date')) {
      // Formatação da data de nascimento
      let formattedValue = value.replace(/\D/g, '');
      
      if (formattedValue.length > 8) {
        formattedValue = formattedValue.slice(0, 8);
      }
      
      if (formattedValue.length > 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}/${formattedValue.slice(4)}`;
      } else if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
      
      maskedValue = formattedValue;
    }

    // Atualizar estado e limpar erro
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            address: {
              ...prev.personal_info.address,
              [child]: maskedValue
            }
          }
        }));
        // Limpar erro do campo de endereço
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`address.${child}`];
          return newErrors;
        });
      } else if (parent === 'personal_info') {
        setFormData(prev => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            [child]: type === 'checkbox' ? checked : maskedValue
          }
        }));
        // Limpar erro do campo pessoal
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`personal_info.${child}`];
          return newErrors;
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : maskedValue
          }
        }));
        // Limpar erro do campo profissional
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${parent}.${child}`];
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : maskedValue
      }));

      // Verificar requisitos da senha
      if (name === 'password') {
        checkPasswordRequirements(value);
      }

      // Limpar erro do campo
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSpecialtiesChange = (selected: string[]) => {
    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        specialties: selected
      }
    }));
    setErrors(prev => ({ ...prev, specialties: "" }));
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const maskedValue = masks.cep(value);
    
    // Atualiza o valor do CEP
    setFormData(prev => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        address: {
          ...prev.personal_info.address,
          zip_code: maskedValue
        }
      }
    }));
    
    // Limpar erro do campo
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors['address.zip_code'];
      return newErrors;
    });

    // Se o CEP estiver completo (8 dígitos), faz a consulta
    if (value.replace(/\D/g, '').length === 8) {
      const cepData = await searchCEP(value);
      
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            address: {
              ...prev.personal_info.address,
              street: cepData.logradouro,
              neighborhood: cepData.bairro,
              city: cepData.localidade,
              state: cepData.uf,
              complement: cepData.complemento
            }
          }
        }));
        
        // Limpar erros de todos os campos preenchidos automaticamente
        setErrors(prev => {
          const newErrors = { ...prev };
          if (cepData.logradouro) delete newErrors['address.street'];
          if (cepData.bairro) delete newErrors['address.neighborhood'];
          if (cepData.localidade) delete newErrors['address.city'];
          if (cepData.uf) delete newErrors['address.state'];
          return newErrors;
        });
      }
    }
  };

  const handleOABStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      professional_info: {
        ...prev.professional_info,
        oab_state: value
      }
    }));
    setErrors(prev => ({ ...prev, 'professional_info.oab_state': "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validações de campos pessoais
    if (!formData.personal_info.name) {
      newErrors['personal_info.name'] = errorMessages.required;
    }

    if (!formData.personal_info.email) {
      newErrors['personal_info.email'] = errorMessages.required;
    } else if (!validations.email(formData.personal_info.email)) {
      newErrors['personal_info.email'] = "Formato de email inválido";
    }

    if (!formData.personal_info.phone) {
      newErrors['personal_info.phone'] = errorMessages.required;
    } else if (!validations.phone(formData.personal_info.phone)) {
      newErrors['personal_info.phone'] = "Formato de telefone inválido";
    }

    if (!formData.personal_info.cpf) {
      newErrors['personal_info.cpf'] = errorMessages.required;
    } else if (!validations.cpf(formData.personal_info.cpf)) {
      newErrors['personal_info.cpf'] = "CPF inválido";
    }

    if (!formData.personal_info.rg) {
      newErrors['personal_info.rg'] = errorMessages.required;
    } else if (!validations.rg(formData.personal_info.rg)) {
      newErrors['personal_info.rg'] = "RG inválido";
    }
    
    // Validação da data de nascimento
    if (!formData.personal_info.birth_date) {
      newErrors['personal_info.birth_date'] = errorMessages.required;
    } else {
      const [day, month, year] = formData.personal_info.birth_date.split('/').map(Number);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        newErrors['personal_info.birth_date'] = "Data inválida";
      } else if (day < 1 || day > 31) {
        newErrors['personal_info.birth_date'] = "Dia inválido";
      } else if (month < 1 || month > 12) {
        newErrors['personal_info.birth_date'] = "Mês inválido";
      } else if (year < 1900 || year > new Date().getFullYear()) {
        newErrors['personal_info.birth_date'] = "Ano inválido";
      } else {
        const date = new Date(year, month - 1, day);
        const today = new Date();
        
        if (isNaN(date.getTime()) || date > today) {
          newErrors['personal_info.birth_date'] = "Data de nascimento inválida";
        }
      }
    }

    // Validações de endereço
    if (!formData.personal_info.address.street) {
      newErrors['address.street'] = errorMessages.required;
    }

    if (!formData.personal_info.address.number) {
      newErrors['address.number'] = errorMessages.required;
    }

    if (!formData.personal_info.address.neighborhood) {
      newErrors['address.neighborhood'] = errorMessages.required;
    }

    if (!formData.personal_info.address.city) {
      newErrors['address.city'] = errorMessages.required;
    }

    if (!formData.personal_info.address.state) {
      newErrors['address.state'] = errorMessages.required;
    } else if (!validations.state(formData.personal_info.address.state)) {
      newErrors['address.state'] = "Estado inválido";
    }

    if (!formData.personal_info.address.zip_code) {
      newErrors['address.zip_code'] = errorMessages.required;
    } else if (!validations.cep(formData.personal_info.address.zip_code)) {
      newErrors['address.zip_code'] = "CEP inválido";
    }

    // Validações profissionais
    if (!formData.professional_info.oab_number) {
      newErrors['professional_info.oab_number'] = errorMessages.required;
    } else if (!validations.oabNumber(formData.professional_info.oab_number)) {
      newErrors['professional_info.oab_number'] = "Número da OAB inválido";
    }

    if (!formData.professional_info.oab_state) {
      newErrors['professional_info.oab_state'] = errorMessages.required;
    } else if (!validations.state(formData.professional_info.oab_state)) {
      newErrors['professional_info.oab_state'] = "Estado da OAB inválido";
    }

    if (!formData.professional_info.department) {
      newErrors['professional_info.department'] = errorMessages.required;
    }

    if (formData.professional_info.specialties.length === 0) {
      newErrors['specialties'] = errorMessages.required;
    }

    // Validações de senha
    if (!formData.password) {
      newErrors['password'] = errorMessages.required;
    } else if (!validations.password(formData.password)) {
      newErrors['password'] = "Senha não atende aos requisitos";
    }

    if (!formData.confirmPassword) {
      newErrors['confirmPassword'] = errorMessages.required;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors['confirmPassword'] = "As senhas não coincidem";
    }

    if (!formData.terms) {
      newErrors['terms'] = errorMessages.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Verifique os campos obrigatórios",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Formata a data de nascimento para o padrão ISO
      const [day, month, year] = formData.personal_info.birth_date.split('/');
      const birthDate = new Date(`${year}-${month}-${day}`);
      
      const payload = {
        personal_info: {
          ...formData.personal_info,
          birth_date: birthDate.toISOString()
        },
        professional_info: {
          ...formData.professional_info,
          hire_date: new Date().toISOString()
        },
        role: formData.role,
        password: formData.password
      };
      await authService.register(payload);
      
    toast({
      title: "Cadastro realizado com sucesso!",
        description: "Redirecionando para o login...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legal-primary/5 via-white to-legal-secondary/5 p-4">
      <Card className="w-full max-w-4xl mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-playfair text-center">Cadastro de Advogado</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full" defaultValue="personal">
              <AccordionItem value="personal">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.name">Nome Completo</Label>
                      <Input
                        id="personal_info.name"
                    name="personal_info.name"
                        type="text"
                        placeholder="Digite seu nome"
                        value={formData.personal_info.name}
                        onChange={handleChange}
                        className={errors['personal_info.name'] ? "border-red-500" : ""}
                        disabled={isLoading}
                      />
                      {errors['personal_info.name'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.name']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.email">Email</Label>
                      <Input
                        id="personal_info.email"
                        name="personal_info.email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.personal_info.email}
                        onChange={handleChange}
                        className={errors['personal_info.email'] ? "border-red-500" : ""}
                        disabled={isLoading}
                      />
                      {errors['personal_info.email'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.email']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.phone">Telefone</Label>
                      <Input
                        id="personal_info.phone"
                        name="personal_info.phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.personal_info.phone}
                        onChange={handleChange}
                        className={errors['personal_info.phone'] ? "border-red-500" : ""}
                        disabled={isLoading}
                        maxLength={15}
                      />
                      {errors['personal_info.phone'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.phone']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.cpf">CPF</Label>
                      <Input
                        id="personal_info.cpf"
                        name="personal_info.cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.personal_info.cpf}
                        onChange={handleChange}
                        className={errors['personal_info.cpf'] ? "border-red-500" : ""}
                        disabled={isLoading}
                        maxLength={14}
                      />
                      {errors['personal_info.cpf'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.cpf']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.rg">RG</Label>
                      <Input
                        id="personal_info.rg"
                        name="personal_info.rg"
                        type="text"
                        placeholder="0.000.000"
                        value={formData.personal_info.rg}
                        onChange={handleChange}
                        className={errors['personal_info.rg'] ? "border-red-500" : ""}
                        disabled={isLoading}
                        maxLength={10}
                      />
                      {errors['personal_info.rg'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.rg']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info.birth_date">Data de Nascimento</Label>
                      <Input
                        id="personal_info.birth_date"
                        name="personal_info.birth_date"
                        type="text"
                        placeholder="DD/MM/AAAA"
                        value={formData.personal_info.birth_date}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          
                          // Permite deleção
                          if (value.length < formData.personal_info.birth_date.replace(/\D/g, '').length) {
                            setFormData(prev => ({
                              ...prev,
                              personal_info: {
                                ...prev.personal_info,
                                birth_date: value
                              }
                            }));
                            return;
                          }
                          
                          // Limita o tamanho máximo
                          if (value.length > 8) value = value.slice(0, 8);
                          
                          // Valida e formata a data
                          if (value.length > 4) {
                            const day = value.slice(0, 2);
                            const month = value.slice(2, 4);
                            const year = value.slice(4);
                            
                            value = `${day}/${month}/${year}`;
                          } else if (value.length > 2) {
                            const day = value.slice(0, 2);
                            const month = value.slice(2);
                            
                            value = `${day}/${month}`;
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            personal_info: {
                              ...prev.personal_info,
                              birth_date: value
                            }
                          }));
                        }}
                        maxLength={10}
                        className={errors['personal_info.birth_date'] ? "border-red-500" : ""}
                        disabled={isLoading}
                      />
                      {errors['personal_info.birth_date'] && (
                        <p className="text-sm text-red-500">{errors['personal_info.birth_date']}</p>
                      )}
                    </div>
                </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="address">
                <AccordionTrigger>Endereço</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        name="address.zip_code"
                        placeholder="00000-000"
                        value={formData.personal_info.address.zip_code}
                        onChange={handleChange}
                        maxLength={9}
                        className={errors['address.zip_code'] ? "border-red-500" : ""}
                      />
                      {errors['address.zip_code'] && (
                        <p className="text-sm text-red-500">{errors['address.zip_code']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        name="address.street"
                        placeholder="Nome da rua"
                        value={formData.personal_info.address.street}
                        onChange={handleChange}
                        className={errors['address.street'] ? "border-red-500" : ""}
                      />
                      {errors['address.street'] && (
                        <p className="text-sm text-red-500">{errors['address.street']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        name="address.number"
                        placeholder="Número"
                        value={formData.personal_info.address.number}
                        onChange={handleChange}
                        className={errors['address.number'] ? "border-red-500" : ""}
                        maxLength={10}
                      />
                      {errors['address.number'] && (
                        <p className="text-sm text-red-500">{errors['address.number']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        name="address.complement"
                        placeholder="Complemento"
                        value={formData.personal_info.address.complement}
                        onChange={handleChange}
                        className={errors['address.complement'] ? "border-red-500" : ""}
                      />
                      {errors['address.complement'] && (
                        <p className="text-sm text-red-500">{errors['address.complement']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        name="address.neighborhood"
                        placeholder="Bairro"
                        value={formData.personal_info.address.neighborhood}
                        onChange={handleChange}
                        className={errors['address.neighborhood'] ? "border-red-500" : ""}
                      />
                      {errors['address.neighborhood'] && (
                        <p className="text-sm text-red-500">{errors['address.neighborhood']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="address.city"
                        placeholder="Cidade"
                        value={formData.personal_info.address.city}
                        onChange={handleChange}
                        className={errors['address.city'] ? "border-red-500" : ""}
                      />
                      {errors['address.city'] && (
                        <p className="text-sm text-red-500">{errors['address.city']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="address.state"
                        placeholder="Estado"
                        value={formData.personal_info.address.state}
                        onChange={handleChange}
                        className={errors['address.state'] ? "border-red-500" : ""}
                      />
                      {errors['address.state'] && (
                        <p className="text-sm text-red-500">{errors['address.state']}</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="professional">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informações Profissionais
                </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="professional_info.oab_number">Número da OAB</Label>
                      <Input
                        id="professional_info.oab_number"
                      name="professional_info.oab_number"
                        type="text"
                        placeholder="Digite o número da OAB"
                        value={formData.professional_info.oab_number}
                        onChange={handleChange}
                        className={errors['professional_info.oab_number'] ? "border-red-500" : ""}
                        disabled={isLoading}
                      />
                      {errors['professional_info.oab_number'] && (
                        <p className="text-sm text-red-500">{errors['professional_info.oab_number']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional_info.oab_state">Estado da OAB</Label>
                      <Select
                        value={formData.professional_info.oab_state}
                        onValueChange={handleOABStateChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={errors['professional_info.oab_state'] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estadosBrasileiros.map((estado) => (
                            <SelectItem key={estado.sigla} value={estado.sigla}>
                              {estado.sigla} - {estado.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors['professional_info.oab_state'] && (
                        <p className="text-sm text-red-500">{errors['professional_info.oab_state']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional_info.department">Departamento</Label>
                      <Input
                        id="professional_info.department"
                        name="professional_info.department"
                        type="text"
                        placeholder="Digite seu departamento"
                        value={formData.professional_info.department}
                        onChange={handleChange}
                        className={errors['professional_info.department'] ? "border-red-500" : ""}
                        disabled={isLoading}
                      />
                      {errors['professional_info.department'] && (
                        <p className="text-sm text-red-500">{errors['professional_info.department']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional_info.specialties">Especialidades</Label>
                      <MultiSelect
                        options={specialties}
                        selected={formData.professional_info.specialties}
                        onChange={handleSpecialtiesChange}
                        placeholder="Selecione as especialidades"
                        disabled={isLoading}
                      />
                      {errors['specialties'] && (
                        <p className="text-sm text-red-500">{errors['specialties']}</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors['password'] ? "border-red-500 pr-10" : "pr-10"}
                      disabled={isLoading}
                              />
                    <Button
                                type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                    </Button>
                            </div>
                  {errors['password'] && (
                    <p className="text-sm text-red-500">{errors['password']}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className={cn("h-4 w-4", passwordRequirements.hasUpperCase ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(passwordRequirements.hasUpperCase ? "text-green-500" : "text-gray-500")}>
                        Pelo menos uma letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className={cn("h-4 w-4", passwordRequirements.hasLowerCase ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(passwordRequirements.hasLowerCase ? "text-green-500" : "text-gray-500")}>
                        Pelo menos uma letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className={cn("h-4 w-4", passwordRequirements.hasNumber ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(passwordRequirements.hasNumber ? "text-green-500" : "text-gray-500")}>
                        Pelo menos um número
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className={cn("h-4 w-4", passwordRequirements.hasSpecialChar ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(passwordRequirements.hasSpecialChar ? "text-green-500" : "text-gray-500")}>
                        Pelo menos um caractere especial
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className={cn("h-4 w-4", passwordRequirements.hasMinLength ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(passwordRequirements.hasMinLength ? "text-green-500" : "text-gray-500")}>
                        Mínimo de 8 caracteres
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors['confirmPassword'] ? "border-red-500 pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors['confirmPassword'] && (
                    <p className="text-sm text-red-500">{errors['confirmPassword']}</p>
                  )}
                  </div>
                </div>
              </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked as boolean }))}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm">
                Eu concordo com os{' '}
                <Link to="/terms" className="text-legal-primary hover:underline">
                  termos de uso
                </Link>
              </Label>
              {errors['terms'] && (
                <p className="text-sm text-red-500">{errors['terms']}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
                </Button>
            <p className="text-sm text-center text-gray-500">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-legal-primary hover:underline"
              >
                Faça login
              </Link>
            </p>
          </CardFooter>
            </form>
      </Card>
    </div>
  );
}
