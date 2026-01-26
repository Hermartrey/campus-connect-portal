export type UserRole = 'student' | 'admin';

export type EnrollmentStatus = 'not_enrolled' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface EnrollmentFormData {
  // Step 1: Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  primarySchool: string;
  gradeLevel: string;
  // Guardian Information
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  secondaryGuardianName?: string;
  secondaryGuardianPhone?: string;
  // Step 2: Documents (store file names for mock)
  birthCertificate?: string;
  primarySchoolGrades?: string;
  additionalDocuments?: string[];
  // Step 4: Payment
  paymentMethod: 'online' | 'onsite';
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'completed';
}

export interface Student extends User {
  role: 'student';
  enrollmentStatus: EnrollmentStatus;
  enrollmentData?: EnrollmentFormData;
  enrollmentSubmittedAt?: string;
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
