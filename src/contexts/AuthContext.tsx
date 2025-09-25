import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { message } from 'antd';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean; // 初始化loading状态
  loginLoading: boolean; // 登录过程loading状态
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 初始化loading
  const [loginLoading, setLoginLoading] = useState(false); // 登录loading

  useEffect(() => {
    // Check for existing token on app start
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      setLoginLoading(true);
      const response = await authAPI.login(credentials);
      const data = response.data;

      // 检查登录是否成功
      if (data.success === false) {
        // 登录失败，直接显示接口返回的错误信息
        message.error(data.message);
        return false;
      }

      // 登录成功
      const { access_token, user: userData } = data;

      // Only allow admin users
      if (userData.role !== 'admin') {
        message.error('只有管理员可以访问后台系统');
        return false;
      }

      setToken(access_token);
      setUser(userData);

      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(userData));

      message.success('登录成功！');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || '登录失败，请检查用户名和密码';
      message.error(errorMessage);
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    message.success('已退出登录');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    loginLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
