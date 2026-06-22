'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStorageData, setStorageData, removeStorageData } from '@/lib/storage';

// 用户角色
export type UserRole = 'province' | 'city';

// 用户信息
export interface UserInfo {
  id: string;
  name: string;
  role: UserRole;
  city?: string;       // 市级用户所属城市
  cityCode?: string;   // 市级用户城市编码
  avatar?: string;
}

// 安徽省各市
export const ANHUI_CITIES = [
  { code: '340100', name: '合肥市' },
  { code: '340200', name: '芜湖市' },
  { code: '340300', name: '蚌埠市' },
  { code: '340400', name: '淮南市' },
  { code: '340500', name: '马鞍山市' },
  { code: '340600', name: '淮北市' },
  { code: '340700', name: '铜陵市' },
  { code: '340800', name: '安庆市' },
  { code: '341000', name: '黄山市' },
  { code: '341100', name: '滁州市' },
  { code: '341200', name: '阜阳市' },
  { code: '341300', name: '宿州市' },
  { code: '341500', name: '六安市' },
  { code: '341600', name: '亳州市' },
  { code: '341700', name: '池州市' },
  { code: '341800', name: '宣城市' },
];

// 预设账号
export const PRESET_ACCOUNTS = [
  { id: 'province-admin', name: '省级管理员', role: 'province' as UserRole, city: undefined, cityCode: undefined },
  { id: 'city-hefei', name: '合肥市管理员', role: 'city' as UserRole, city: '合肥市', cityCode: '340100' },
  { id: 'city-wuhu', name: '芜湖市管理员', role: 'city' as UserRole, city: '芜湖市', cityCode: '340200' },
  { id: 'city-bengbu', name: '蚌埠市管理员', role: 'city' as UserRole, city: '蚌埠市', cityCode: '340300' },
  { id: 'city-huainan', name: '淮南市管理员', role: 'city' as UserRole, city: '淮南市', cityCode: '340400' },
  { id: 'city-maanshan', name: '马鞍山市管理员', role: 'city' as UserRole, city: '马鞍山市', cityCode: '340500' },
  { id: 'city-huaibei', name: '淮北市管理员', role: 'city' as UserRole, city: '淮北市', cityCode: '340600' },
  { id: 'city-tongling', name: '铜陵市管理员', role: 'city' as UserRole, city: '铜陵市', cityCode: '340700' },
  { id: 'city-anqing', name: '安庆市管理员', role: 'city' as UserRole, city: '安庆市', cityCode: '340800' },
  { id: 'city-huangshan', name: '黄山市管理员', role: 'city' as UserRole, city: '黄山市', cityCode: '341000' },
  { id: 'city-chuzhou', name: '滁州市管理员', role: 'city' as UserRole, city: '滁州市', cityCode: '341100' },
  { id: 'city-fuyang', name: '阜阳市管理员', role: 'city' as UserRole, city: '阜阳市', cityCode: '341200' },
  { id: 'city-suzhou', name: '宿州市管理员', role: 'city' as UserRole, city: '宿州市', cityCode: '341300' },
  { id: 'city-luan', name: '六安市管理员', role: 'city' as UserRole, city: '六安市', cityCode: '341500' },
  { id: 'city-bozhou', name: '亳州市管理员', role: 'city' as UserRole, city: '亳州市', cityCode: '341600' },
  { id: 'city-chizhou', name: '池州市管理员', role: 'city' as UserRole, city: '池州市', cityCode: '341700' },
  { id: 'city-xuancheng', name: '宣城市管理员', role: 'city' as UserRole, city: '宣城市', cityCode: '341800' },
];

const AUTH_STORAGE_KEY = 'liangshi_auth_user';

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (user: UserInfo) => void;
  logout: () => void;
  switchAccount: (user: UserInfo) => void;
  locationText: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  // 从localStorage恢复登录状态
  useEffect(() => {
    const savedUser = getStorageData<UserInfo | null>(AUTH_STORAGE_KEY, null);
    if (savedUser) {
      setUser(savedUser);
    }
    setMounted(true);
  }, []);

  const login = useCallback((newUser: UserInfo) => {
    setUser(newUser);
    setStorageData(AUTH_STORAGE_KEY, newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStorageData(AUTH_STORAGE_KEY);
  }, []);

  const switchAccount = useCallback((newUser: UserInfo) => {
    setUser(newUser);
    setStorageData(AUTH_STORAGE_KEY, newUser);
  }, []);

  const locationText = user?.role === 'city' && user.city
    ? `当前位置：${user.city}`
    : '当前位置：安徽省';

  // 避免hydration mismatch，未mount时不渲染
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        isLoggedIn: false,
        isInitialized: false,
        login: () => {},
        logout: () => {},
        switchAccount: () => {},
        locationText: '当前位置：安徽省',
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isInitialized: true,
      login,
      logout,
      switchAccount,
      locationText,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
