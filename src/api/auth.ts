import { API_BASE_URL, type UserData } from './config';

export interface LoginResponse {
  access_token?: string;
  user?: UserData;
  message?: string;
}

export const login = async (npm_atau_nip: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ npm_atau_nip, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Login gagal');
  }

  return data;
};
