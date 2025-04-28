import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterData {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    birth_date: string;
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
    oab_number: string;
    oab_state: string;
    specialties: string[];
    hire_date: string;
    department: string;
    supervisor_id: string;
  };
  role: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private static readonly USER_KEY = 'jurisconnect_user';
  private static readonly REMEMBER_KEY = 'jurisconnect_remember';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/login', credentials);
      const { user } = response.data;
      
      // Salvar dados do usuário
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      localStorage.setItem(AuthService.REMEMBER_KEY, String(credentials.remember));
      
      return { user };
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Erro ao fazer login');
    }
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/users', data);
      const { user } = response.data;
      
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      localStorage.setItem(AuthService.REMEMBER_KEY, 'true');
      
      return { user };
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Erro ao realizar cadastro');
    }
  }

  public async logout(): Promise<void> {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem(AuthService.USER_KEY);
      localStorage.removeItem(AuthService.REMEMBER_KEY);
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getUser();
  }

  public getUser(): any {
    const userStr = localStorage.getItem(AuthService.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = AuthService.getInstance(); 