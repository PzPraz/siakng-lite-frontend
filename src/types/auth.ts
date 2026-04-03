import type { ReactNode } from 'react';

export type UserRole = 'DOSEN' | 'MAHASISWA';

export interface AuthUser {
  nama?: string;
  role?: UserRole;
  npm_atau_nip?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | undefined;
  isAuthenticated: boolean;
  login: (tokenValue: string, userValue: AuthUser) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface Student {
  id?: number;
  npm: string;
  nama: string;
  statusIrs?: string;
}

export interface UserData {
  nama?: string;
  role?: 'DOSEN' | 'MAHASISWA';
  npm?: string;
  nip?: string;
  npm_atau_nip?: string;
}

export interface LoginResponse {
  access_token?: string;
  user?: UserData;
  message?: string;
}
