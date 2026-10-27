import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName, UserOrganization } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: RoleName | 'HOME' | null;
  activeOrg: UserOrganization | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setActiveRole: (role: RoleName | 'HOME') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token');
  });
  const [activeRole, setActiveRoleState] = useState<RoleName | 'HOME' | null>(() => {
    return (localStorage.getItem('active_role') as RoleName | 'HOME') || 'HOME';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.roles.length > 0 && (!activeRole || activeRole === 'HOME')) {
      // Set default active role from user roles if logged in
      const defaultRole = user.roles.find(r => 
        ['HOSPITAL_STAFF', 'BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'].includes(r)
      ) || user.roles[0];
      setActiveRoleState(defaultRole);
      localStorage.setItem('active_role', defaultRole);
    }
  }, [user]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await api.login(credentials);
      setUser(result.user);
      setToken(result.accessToken);

      localStorage.setItem('auth_user', JSON.stringify(result.user));
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);

      const targetRole = result.user.roles.find(r => 
        ['HOSPITAL_STAFF', 'BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'].includes(r)
      ) || result.user.roles[0];

      setActiveRoleState(targetRole);
      localStorage.setItem('active_role', targetRole);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveRoleState('HOME');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('active_role');
  };

  const setActiveRole = (role: RoleName | 'HOME') => {
    setActiveRoleState(role);
    localStorage.setItem('active_role', role);
  };

  const activeOrg = user?.organization || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        activeOrg,
        isLoading,
        login,
        logout,
        setActiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
