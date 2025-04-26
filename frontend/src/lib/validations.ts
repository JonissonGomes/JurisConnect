export const masks = {
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },
  cpf: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },
  rg: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  },
  cep: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
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