import { useState, useEffect } from 'react';
import { Student, Payment } from '@/types/auth';

const USERS_KEY = 'school_users';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);

  const loadStudents = () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const studentList = users.filter((u: any) => u.role === 'student').map(({ password, ...s }: any) => s);
    setStudents(studentList);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const updateStudentStatus = (studentId: string, status: 'pending' | 'approved' | 'rejected') => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === studentId ? { ...u, enrollmentStatus: status } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const addPayment = (studentId: string, payment: Omit<Payment, 'id'>) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        const newPayment = { ...payment, id: `payment-${Date.now()}` };
        const newBalance = payment.status === 'completed' ? u.tuitionBalance - payment.amount : u.tuitionBalance;
        return {
          ...u,
          payments: [...(u.payments || []), newPayment],
          tuitionBalance: Math.max(0, newBalance),
        };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const getStudentById = (studentId: string): Student | undefined => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const student = users.find((u: any) => u.id === studentId && u.role === 'student');
    if (student) {
      const { password, ...s } = student;
      return s;
    }
    return undefined;
  };

  const refreshCurrentStudent = (studentId: string): Student | undefined => {
    return getStudentById(studentId);
  };

  return {
    students,
    updateStudentStatus,
    addPayment,
    getStudentById,
    refreshCurrentStudent,
    refresh: loadStudents,
  };
}
