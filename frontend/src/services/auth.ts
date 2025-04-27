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

  private constructor() {
    if (!this.shouldRemember()) {
      this.logout();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private shouldRemember(): boolean {
    return localStorage.getItem(AuthService.REMEMBER_KEY) === 'true';
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/login', credentials);
      const { user, token } = response.data;
      
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      localStorage.setItem(AuthService.REMEMBER_KEY, String(credentials.remember));
      
      if (credentials.remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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
      const { user, token } = response.data;
      
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      localStorage.setItem(AuthService.REMEMBER_KEY, 'true');
      localStorage.setItem('token', token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { user };
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Erro ao realizar cadastro');
    }
  }

  public logout(): void {
    localStorage.removeItem(AuthService.USER_KEY);
    localStorage.removeItem(AuthService.REMEMBER_KEY);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getUser(): any {
    const user = localStorage.getItem(AuthService.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  public getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
}

export const authService = AuthService.getInstance(); 