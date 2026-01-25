export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  enrollmentStatus: 'pending' | 'approved' | 'rejected';
  gradeLevel?: string;
  tuitionBalance: number;
  payments: Payment[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface EnrollmentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gradeLevel: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
