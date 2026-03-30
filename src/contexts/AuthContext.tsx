/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getToken, getUser, removeToken, setToken, setUser } from '../api/config';

type UserRole = 'DOSEN' | 'MAHASISWA' | string;

export interface AuthUser {
  nama?: string;
  role?: UserRole;
  npm_atau_nip?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | undefined;
  isAuthenticated: boolean;
  login: (tokenValue: string, userValue: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [tokenState, setTokenState] = useState<string | undefined>(() => getToken());
  const [user, setUserState] = useState<AuthUser | null>(() => getUser());

  const login = (tokenValue: string, userValue: AuthUser) => {
    setToken(tokenValue);
    setUser(userValue);
    setTokenState(tokenValue);
    setUserState(userValue);
  };

  const logout = () => {
    removeToken();
    setTokenState(undefined);
    setUserState(null);
  };

  const value = useMemo(
    () => ({
      user,
      token: tokenState,
      isAuthenticated: Boolean(tokenState),
      login,
      logout,
    }),
    [user, tokenState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
