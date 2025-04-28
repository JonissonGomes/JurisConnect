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
  profile_image?: string;
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
  personal_info: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    birth_date: string;
    profile_image?: string;
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
  professional_info: {
    oab_number?: string;
    oab_state?: string;
    specialties: string[];
    hire_date: string;
    department: string;
    supervisor_id?: string;
  };
  role: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const user = JSON.parse(localStorage.getItem('jurisconnect_user') || '{}');
    const response = await api.get(`/api/users/${user.id}`);
    return response.data;
  },

  async updateUser(data: Partial<User>): Promise<User> {
    const user = JSON.parse(localStorage.getItem('jurisconnect_user') || '{}');
    const response = await api.put(`/api/users/${user.id}`, data);
    return response.data;
  },

  async updateProfileImage(file: File): Promise<string> {
    // Simulando o upload de imagem
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'lawyer':
        return 'Advogado';
      case 'intern':
        return 'Estagiário';
      case 'secretary':
        return 'Secretário';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  }
}; 