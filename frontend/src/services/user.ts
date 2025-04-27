import { api } from './api';

export interface Address {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  birth_date: string;
  address: Address;
}

export interface ProfessionalInfo {
  oab_number: string;
  oab_state: string;
  specialties: string[];
  hire_date: string;
  department: string;
  supervisor_id: string;
}

export interface User {
  id: string;
  personal_info: PersonalInfo;
  professional_info: ProfessionalInfo;
  role: 'client' | 'lawyer';
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateUser(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  getRoleLabel(role: string): string {
    return role === 'lawyer' ? 'Advogado' : 'Cliente';
  }
}; 