import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Admin } from '@/types/auth';

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

const STORAGE_KEY = 'school_auth_user';
const USERS_KEY = 'school_users';

// Initialize default admin if not exists
const initializeDefaultAdmin = () => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const adminExists = users.some((u: User) => u.role === 'admin');

  if (!adminExists) {
    const defaultAdmin: Admin = {
      id: 'admin-1',
      email: 'admin@school.com',
      name: 'School Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    users.push({ ...defaultAdmin, password: 'admin123' });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDefaultAdmin();
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    if (users.some((u: User) => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser: Student | Admin = role === 'student'
      ? {
        id: `student-${Date.now()}`,
        email,
        name,
        role: 'student',
        createdAt: new Date().toISOString(),
        enrollmentStatus: 'not_enrolled',
        tuitionBalance: 0,
        payments: [],
      }
      : {
        id: `admin-${Date.now()}`,
        email,
        name,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

    users.push({ ...newUser, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if email belongs to someone else
    if (email !== user.email && users.some((u: User) => u.email === email && u.id !== user.id)) {
      return { success: false, error: 'Email already in use' };
    }

    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        return { ...u, name, email };
      }
      return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    return { success: true };
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const currentUserIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (currentUserIndex === -1) return { success: false, error: 'User not found' };
    
    if (users[currentUserIndex].password !== oldPassword) {
      return { success: false, error: 'Incorrect old password' };
    }

    users[currentUserIndex].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return { success: true };
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
