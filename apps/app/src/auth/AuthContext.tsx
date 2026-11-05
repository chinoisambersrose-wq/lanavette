import type { Role } from 'shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient, setAccessToken, setOnAuthFailure } from '../lib/apiClient.js';

export interface AuthUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: Role;
}

interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | undefined;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOnAuthFailure(() => setUser(undefined));

    apiClient
      .post<{ accessToken: string }>('/auth/refresh')
      .then(async (result) => {
        setAccessToken(result.accessToken);
        const me = await apiClient.get<AuthUser>('/auth/me');
        setUser(me);
      })
      .catch(() => {
        setAccessToken(undefined);
      })
      .finally(() => setIsLoading(false));

    return () => setOnAuthFailure(undefined);
  }, []);

  const login = useCallback(async (email: string, motDePasse: string) => {
    const result = await apiClient.post<LoginResult>('/auth/login', { email, motDePasse });
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout').catch(() => undefined);
    setAccessToken(undefined);
    setUser(undefined);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }

  return context;
}
