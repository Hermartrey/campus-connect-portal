import { useState, useEffect, useCallback } from 'react';
import { Student, Payment, EnrollmentFormData } from '@/types/auth';
import { useNotifications } from '@/hooks/useNotifications';
import api from '@/lib/api';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(true);
  const { addNotification } = useNotifications();

  const loadStudents = useCallback(async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
      
      const resSettings = await api.get('/settings/enrollment');
      setIsEnrollmentOpen(resSettings.data.isOpen);
    } catch (error) {
      console.error("Failed to load students", error);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const updateStudentStatus = async (studentId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await api.put(`/students/${studentId}/status`, { status });
      // The backend automatically adjusts payment/tuition balances, so we just reload.
      await loadStudents();
    } catch (e) {
      console.error("Error updating status", e);
    }
  };

  const submitEnrollment = async (studentId: string, enrollmentData: EnrollmentFormData) => {
    try {
      await api.post(`/students/${studentId}/enroll`, enrollmentData);
      await loadStudents();
    } catch (e) {
      console.error("Error submitting enrollment", e);
    }
  };

  const updateStudentData = async (studentId: string, data: Partial<EnrollmentFormData>) => {
    try {
      await api.put(`/students/${studentId}/enrollment-data`, data);
      await loadStudents();
    } catch (e) {
      console.error("Error updating student data", e);
    }
  };

  const addPayment = async (studentId: string, payment: Omit<Payment, 'id'>) => {
    try {
       // Backend handles appending id and creating the structure.
      await api.post(`/students/${studentId}/payments`, payment);
      await loadStudents();
    } catch (e) {
      console.error("Error adding payment", e);
    }
  };

  const getStudentById = (studentId: string): Student | undefined => {
    return students.find((u) => u.id === studentId);
  };

  const refreshCurrentStudent = async (studentId: string): Promise<Student | undefined> => {
    try {
      const res = await api.get(`/students/${studentId}`);
      // Also silently updates list cache to stay fresh
      setStudents(prev => prev.map(s => s.id === studentId ? res.data : s));
      return res.data;
    } catch (e) {
      console.error("Error fetching single student", e);
      return undefined;
    }
  };

  const confirmPayment = async (studentId: string, paymentId: string) => {
    try {
      await api.put(`/students/${studentId}/payments/${paymentId}/confirm`);
      await loadStudents();
    } catch (e) {
      console.error("Error confirming payment", e);
    }
  };
  
  const cancelPayment = async (studentId: string, paymentId: string) => {
    try {
      await api.put(`/students/${studentId}/payments/${paymentId}/cancel`);
      await loadStudents();
    } catch (e) {
      console.error("Error cancelling payment", e);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/students/${studentId}`);
      await loadStudents();
    } catch (e) {
      console.error("Error deleting student", e);
    }
  };

  const updateTuitionBalance = async (studentId: string, newBalance: number) => {
    try {
      // Find current balance just to send the client-side notification if needed
      const student = getStudentById(studentId);
      if (student && student.tuitionBalance !== newBalance) {
          const diff = newBalance - student.tuitionBalance;
          const isCredit = diff < 0; // Balance went DOWN
          
          addNotification({
              userId: studentId,
              title: 'Balance Adjusted',
              message: `Your tuition balance has been adjusted. ${isCredit ? 'Credit' : 'Debit'}: $${Math.abs(diff).toLocaleString()}. Reason: Manual Adjustment.`,
              type: 'info',
              link: '/dashboard/payments'
          });
      }

      await api.put(`/students/${studentId}/balance`, { newBalance });
      await loadStudents();
    } catch (e) {
      console.error("Error updating balance", e);
    }
  };

  const resetEnrollment = async (studentId: string) => {
    try {
      await api.post(`/students/${studentId}/reset-enrollment`);
      await loadStudents();
    } catch (e) {
      console.error("Error resetting enrollment", e);
    }
  };

  const resetAllEnrollments = async () => {
    try {
      await api.post(`/students/reset-all-enrollments`);
      await loadStudents();
    } catch (e) {
      console.error("Error resetting all enrollments", e);
    }
  };

  const toggleEnrollment = async (isOpen: boolean) => {
    try {
      await api.put(`/settings/enrollment`, { isOpen });
      setIsEnrollmentOpen(isOpen);
    } catch (e) {
       console.error("Error toggling enrollment", e);
    }
  }

  return {
    students,
    updateStudentStatus,
    submitEnrollment,
    updateStudentData,
    updateTuitionBalance,
    addPayment,
    getStudentById,
    refreshCurrentStudent,
    deleteStudent,
    confirmPayment,
    cancelPayment,
    resetEnrollment,
    resetAllEnrollments,
    isEnrollmentOpen,
    toggleEnrollment,
    refresh: loadStudents,
  };
}
