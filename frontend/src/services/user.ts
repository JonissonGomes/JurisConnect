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
  personal_info: PersonalInfo;
  professional_info: ProfessionalInfo;
  role: 'admin' | 'lawyer' | 'intern' | 'secretary' | 'client';
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

  async updateProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    const response = await api.post('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
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