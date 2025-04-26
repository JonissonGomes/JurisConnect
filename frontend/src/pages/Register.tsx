import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { masks, validations, errorMessages } from "@/lib/validations";
import { authService } from "@/services/auth";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let maskedValue = value;

    // Aplicar máscaras
    if (name.includes('phone')) {
      maskedValue = masks.phone(value);
    } else if (name.includes('cpf')) {
      maskedValue = masks.cpf(value);
    } else if (name.includes('rg')) {
      maskedValue = masks.rg(value);
    } else if (name.includes('zip_code')) {
      maskedValue = masks.cep(value);
    }

    // Atualizar estado
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
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : maskedValue
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : maskedValue
      }));
    }

    // Limpar erro ao digitar
    setErrors(prev => ({ ...prev, [name]: "" }));
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validações de campos pessoais
    if (!formData.personal_info.name) newErrors['personal_info.name'] = errorMessages.required;
    if (!validations.email(formData.personal_info.email)) newErrors['personal_info.email'] = errorMessages.email;
    if (!validations.phone(formData.personal_info.phone)) newErrors['personal_info.phone'] = errorMessages.phone;
    if (!validations.cpf(formData.personal_info.cpf)) newErrors['personal_info.cpf'] = errorMessages.cpf;
    if (!validations.rg(formData.personal_info.rg)) newErrors['personal_info.rg'] = errorMessages.rg;
    if (!formData.personal_info.birth_date) newErrors['personal_info.birth_date'] = errorMessages.required;

    // Validações de endereço
    if (!formData.personal_info.address.street) newErrors['address.street'] = errorMessages.required;
    if (!formData.personal_info.address.number) newErrors['address.number'] = errorMessages.required;
    if (!formData.personal_info.address.neighborhood) newErrors['address.neighborhood'] = errorMessages.required;
    if (!formData.personal_info.address.city) newErrors['address.city'] = errorMessages.required;
    if (!validations.state(formData.personal_info.address.state)) newErrors['address.state'] = errorMessages.state;
    if (!validations.cep(formData.personal_info.address.zip_code)) newErrors['address.zip_code'] = errorMessages.cep;

    // Validações profissionais
    if (!validations.oabNumber(formData.professional_info.oab_number)) newErrors['professional_info.oab_number'] = errorMessages.oabNumber;
    if (!validations.state(formData.professional_info.oab_state)) newErrors['professional_info.oab_state'] = errorMessages.state;
    if (!formData.professional_info.department) newErrors['professional_info.department'] = errorMessages.required;
    if (formData.professional_info.specialties.length === 0) newErrors['specialties'] = errorMessages.specialties;

    // Validações de senha
    if (!validations.password(formData.password)) newErrors['password'] = errorMessages.password;
    if (formData.password !== formData.confirmPassword) newErrors['confirmPassword'] = errorMessages.passwordMatch;
    if (!formData.terms) newErrors['terms'] = errorMessages.terms;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        personal_info: {
          ...formData.personal_info,
          birth_date: new Date(formData.personal_info.birth_date).toISOString()
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
      <Card className="w-full max-w-4xl mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center font-playfair">Cadastro de Advogado</CardTitle>
          <CardDescription className="text-center text-base">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Digite seu email"
                    value={formData.personal_info.email}
                    onChange={handleChange}
                    className={errors['personal_info.email'] ? "border-red-500" : ""}
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
                    placeholder="00.000.000-0"
                    value={formData.personal_info.rg}
                    onChange={handleChange}
                    className={errors['personal_info.rg'] ? "border-red-500" : ""}
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
                    type="date"
                    value={formData.personal_info.birth_date}
                    onChange={handleChange}
                    className={errors['personal_info.birth_date'] ? "border-red-500" : ""}
                  />
                  {errors['personal_info.birth_date'] && (
                    <p className="text-sm text-red-500">{errors['personal_info.birth_date']}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.street">Rua</Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    type="text"
                    placeholder="Digite sua rua"
                    value={formData.personal_info.address.street}
                    onChange={handleChange}
                    className={errors['address.street'] ? "border-red-500" : ""}
                  />
                  {errors['address.street'] && (
                    <p className="text-sm text-red-500">{errors['address.street']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.number">Número</Label>
                  <Input
                    id="address.number"
                    name="address.number"
                    type="text"
                    placeholder="123"
                    value={formData.personal_info.address.number}
                    onChange={handleChange}
                    className={errors['address.number'] ? "border-red-500" : ""}
                  />
                  {errors['address.number'] && (
                    <p className="text-sm text-red-500">{errors['address.number']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.complement">Complemento</Label>
                  <Input
                    id="address.complement"
                    name="address.complement"
                    type="text"
                    placeholder="Apto 123"
                    value={formData.personal_info.address.complement}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.neighborhood">Bairro</Label>
                  <Input
                    id="address.neighborhood"
                    name="address.neighborhood"
                    type="text"
                    placeholder="Digite seu bairro"
                    value={formData.personal_info.address.neighborhood}
                    onChange={handleChange}
                    className={errors['address.neighborhood'] ? "border-red-500" : ""}
                  />
                  {errors['address.neighborhood'] && (
                    <p className="text-sm text-red-500">{errors['address.neighborhood']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.city">Cidade</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    type="text"
                    placeholder="Digite sua cidade"
                    value={formData.personal_info.address.city}
                    onChange={handleChange}
                    className={errors['address.city'] ? "border-red-500" : ""}
                  />
                  {errors['address.city'] && (
                    <p className="text-sm text-red-500">{errors['address.city']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.state">Estado</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    type="text"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.personal_info.address.state}
                    onChange={handleChange}
                    className={errors['address.state'] ? "border-red-500" : ""}
                  />
                  {errors['address.state'] && (
                    <p className="text-sm text-red-500">{errors['address.state']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.zip_code">CEP</Label>
                  <Input
                    id="address.zip_code"
                    name="address.zip_code"
                    type="text"
                    placeholder="00000-000"
                    value={formData.personal_info.address.zip_code}
                    onChange={handleChange}
                    className={errors['address.zip_code'] ? "border-red-500" : ""}
                  />
                  {errors['address.zip_code'] && (
                    <p className="text-sm text-red-500">{errors['address.zip_code']}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Informações Profissionais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                  {errors['professional_info.oab_number'] && (
                    <p className="text-sm text-red-500">{errors['professional_info.oab_number']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional_info.oab_state">Estado da OAB</Label>
                  <Input
                    id="professional_info.oab_state"
                    name="professional_info.oab_state"
                    type="text"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.professional_info.oab_state}
                    onChange={handleChange}
                    className={errors['professional_info.oab_state'] ? "border-red-500" : ""}
                  />
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
                  />
                  {errors['specialties'] && (
                    <p className="text-sm text-red-500">{errors['specialties']}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Senha</h4>
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
                    className={errors['password'] ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors['password'] && (
                  <p className="text-sm text-red-500">{errors['password']}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors['confirmPassword'] ? "border-red-500" : ""}
                />
                {errors['confirmPassword'] && (
                  <p className="text-sm text-red-500">{errors['confirmPassword']}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked as boolean }))}
              />
              <Label htmlFor="terms" className="text-sm">
                Eu concordo com os{" "}
                <Button variant="link" className="px-0 h-auto" onClick={() => window.open('/terms', '_blank')}>
                  termos de uso
                </Button>
              </Label>
              {errors['terms'] && (
                <p className="text-sm text-red-500">{errors['terms']}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Criar Conta"}
            </Button>
            <div className="text-center text-sm">
              Já tem uma conta?{" "}
              <Button variant="link" className="px-0" onClick={() => navigate("/login")}>
                Faça login
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
