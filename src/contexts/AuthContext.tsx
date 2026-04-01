import { createContext, useContext, useMemo, useState } from 'react';
import { getToken, getUser, removeToken, setToken, setUser } from '../api/config';
import type { AuthUser } from '../types/api';
import type { AuthContextValue } from '../types/api';
import type { AuthProviderProps } from '../types/api';


const AuthContext = createContext<AuthContextValue | undefined>(undefined);


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
