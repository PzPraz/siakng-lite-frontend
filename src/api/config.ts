import Cookies from 'js-cookie';
import type { UserData } from '../types/api';

export const API_BASE_URL = 'https://siakng-lite-backend-production.up.railway.app';

export const setToken = (token: string) => {
  Cookies.set('access_token', token, { expires: 1, secure: true, sameSite: 'strict' });
};

export const getToken = () => Cookies.get('access_token');

export const removeToken = () => {
  Cookies.remove('access_token');
  Cookies.remove('user');
};

export const setUser = (user: UserData) => {
  Cookies.set('user', JSON.stringify(user), { expires: 1 });
};

export const getUser = (): UserData | null => {
  const user = Cookies.get('user');
  return user ? (JSON.parse(user) as UserData) : null;
};
