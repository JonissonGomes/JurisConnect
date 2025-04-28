import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, userService } from '@/services/user';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface UserContextData {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user: authUser } = useAuth();

  const fetchUser = async () => {
    if (!authUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/users/${authUser.id}`);
      setUser(response.data);
    } catch (err) {
      setError('Erro ao carregar dados do usuário');
      console.error('Erro ao carregar usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authUser?.id) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isAuthenticated, authUser?.id]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 