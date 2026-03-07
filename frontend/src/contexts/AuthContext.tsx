import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Admin } from '@/types/auth';
import api from '@/lib/api';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (email: string, password: string, name: string, role: 'student' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user from local storage token info
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const { user: savedUser } = JSON.parse(storedUser);
        setUser(savedUser);
      } catch (e) {
        console.error("Failed parsing user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
      return { success: true, user };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
         return { success: false, error: 'Invalid email or password' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/signup', { email, password, name, role });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return { success: false, error: 'Email already exists' };
      }
      return { success: false, error: 'Failed to register account' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
       // Using the mock endpoint query params workaround pending full backend auth middleware
      await api.put(`/auth/profile?user_id=${user.id}`, { name, email });
      
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      
      // Update local storage so persistence remains accurate 
      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if(storedAuth) {
         const authData = JSON.parse(storedAuth);
         authData.user = updatedUser;
         localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      }

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return { success: false, error: error.response.data.detail || 'Failed to update profile' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      await api.put(`/auth/password?user_id=${user.id}`, { oldPassword, newPassword });
      return { success: true };
    } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
        return { success: false, error: error.response.data.detail || 'Incorrect old password' };
       }
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, changePassword, isLoading }}>
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
