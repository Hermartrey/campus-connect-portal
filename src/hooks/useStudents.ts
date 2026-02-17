import { useState, useEffect } from 'react';
import { Student, Payment, EnrollmentFormData } from '@/types/auth';
import { useNotifications } from '@/hooks/useNotifications';

const USERS_KEY = 'school_users';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const { addNotification } = useNotifications();

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
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        const updates: any = { enrollmentStatus: status };
        // Set tuition balance when approved based on grade level
        if (status === 'approved') {
          // Get tuition config from localStorage
          const tuitionConfigStr = localStorage.getItem('tuition_config');
          let tuitionAmount = 5000; // default fallback

          if (tuitionConfigStr) {
            try {
              const tuitionConfig = JSON.parse(tuitionConfigStr);
              const gradeLevel = u.enrollmentData?.gradeLevel || u.gradeLevel;
              const rate = tuitionConfig.rates?.find((r: any) => r.gradeLevel === gradeLevel);
              if (rate) {
                tuitionAmount = rate.amount;
              }
            } catch (e) {
              console.error('Error parsing tuition config:', e);
            }
          }

          // Deduct upfront payment
          const upfrontPayment = u.enrollmentData?.paymentAmount || 0;
          updates.tuitionBalance = Math.max(0, tuitionAmount - upfrontPayment);

          // Add upfront payment to payment history if paid online
          if (upfrontPayment > 0) {
            const upfrontRecord: Payment = {
              id: `upfront-${Date.now()}`,
              amount: upfrontPayment,
              date: new Date().toISOString(),
              status: 'completed',
              description: 'Upfront Enrollment Payment',
              receipt: u.enrollmentData?.paymentReceipt,
              receiptName: u.enrollmentData?.paymentReceiptName,
            };
            updates.payments = [...(u.payments || []), upfrontRecord];
          }
        }
        return { ...u, ...updates };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const submitEnrollment = (studentId: string, enrollmentData: EnrollmentFormData) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        return {
          ...u,
          enrollmentStatus: 'pending',
          enrollmentData,
          enrollmentSubmittedAt: new Date().toISOString(),
          gradeLevel: enrollmentData.gradeLevel,
        };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const updateStudentData = (studentId: string, data: Partial<EnrollmentFormData>) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        return {
          ...u,
          enrollmentData: { ...u.enrollmentData, ...data },
        };
      }
      return u;
    });
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

  const confirmPayment = (studentId: string, paymentId: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        // Find the payment to confirm
        const paymentToConfirm = u.payments?.find((p: Payment) => p.id === paymentId);

        if (paymentToConfirm && paymentToConfirm.status === 'pending') {
          // Update payment status
          const updatedPayments = u.payments.map((p: Payment) => {
            if (p.id === paymentId) {
              return { ...p, status: 'completed' as const };
            }
            return p;
          });

          // Deduct balance
          const newBalance = Math.max(0, u.tuitionBalance - paymentToConfirm.amount);

          return {
            ...u,
            payments: updatedPayments,
            tuitionBalance: newBalance,
          };
        }
      }
      return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };
  const cancelPayment = (studentId: string, paymentId: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        // Find the payment to cancel
        const paymentToCancel = u.payments?.find((p: Payment) => p.id === paymentId);

        if (paymentToCancel && paymentToCancel.status === 'pending') {
          // Update payment status
          const updatedPayments = u.payments.map((p: Payment) => {
            if (p.id === paymentId) {
              return { ...p, status: 'cancelled' as const };
            }
            return p;
          });

          return {
            ...u,
            payments: updatedPayments,
          };
        }
      }
      return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const deleteStudent = (studentId: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== studentId);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const updateTuitionBalance = (studentId: string, newBalance: number) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        // Calculate difference
        const oldBalance = u.tuitionBalance || 0;

        // Only record if changed
        if (oldBalance !== newBalance) {
          const diff = newBalance - oldBalance;
          // Determine if it looks like a credit (balance reduced) or debit (balance increased)
          const isCredit = diff < 0; // Balance went DOWN (e.g., 5000 -> 4000) = Credit (Payment like)

          const adjustmentRecord: Payment = {
            id: `adj-${Date.now()}`,
            amount: Math.abs(diff),
            date: new Date().toISOString(),
            status: 'completed',
            description: `Manual Adjustment: ${oldBalance.toLocaleString()} -> ${newBalance.toLocaleString()}`,
            type: 'adjustment',
            adjustmentType: isCredit ? 'credit' : 'debit'
          };

          // Notify the student
          addNotification({
            userId: studentId,
            title: 'Balance Adjusted',
            message: `Your tuition balance has been adjusted. ${isCredit ? 'Credit' : 'Debit'}: $${Math.abs(diff).toLocaleString()}. Reason: Manual Adjustment.`,
            type: 'info',
            link: '/dashboard/payments'
          });

          return {
            ...u,
            tuitionBalance: newBalance,
            payments: [...(u.payments || []), adjustmentRecord]
          };
        }

        return u;
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const resetEnrollment = (studentId: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === studentId) {
        return {
          ...u,
          enrollmentStatus: 'not_enrolled',
          enrollmentData: undefined,
          enrollmentSubmittedAt: undefined,
        };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

  const resetAllEnrollments = () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.role === 'student') {
        return {
          ...u,
          enrollmentStatus: 'not_enrolled',
          enrollmentData: undefined,
          enrollmentSubmittedAt: undefined,
          // Keep tuitionBalance and payments intact
        };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    loadStudents();
  };

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
    refresh: loadStudents,
  };
}
