export const masks = {
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  },
  cpf: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  },
  rg: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 1)}.${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4, 7)}`;
  },
  cep: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  },
};

export const validations = {
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  phone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  cpf: (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  },
  rg: (rg: string) => {
    const cleaned = rg.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 9;
  },
  cep: (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  },
  password: (password: string) => {
    return password.length >= 8;
  },
  state: (state: string) => {
    return state.length === 2;
  },
  oabNumber: (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 6 && cleaned.length <= 8;
  },
};

export const errorMessages = {
  email: "Email inválido",
  phone: "Telefone inválido",
  cpf: "CPF inválido",
  rg: "RG inválido",
  cep: "CEP inválido",
  password: "Senha deve ter no mínimo 8 caracteres",
  state: "Estado deve ter 2 caracteres",
  oabNumber: "Número da OAB inválido",
  required: "Campo obrigatório",
  specialties: "Selecione pelo menos uma especialidade",
  terms: "Você precisa aceitar os termos de uso",
  passwordMatch: "As senhas não coincidem",
}; 