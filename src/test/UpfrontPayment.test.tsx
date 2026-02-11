import { renderHook, act } from '@testing-library/react';
import { useStudents } from '../hooks/useStudents';
import { EnrollmentFormData } from '../types/auth';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key: string) => { delete store[key]; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useStudents - Upfront Payment Deduction', () => {
    beforeEach(() => {
        localStorage.clear();
        const mockUsers = [
            {
                id: 'student-1',
                name: 'Test Student',
                email: 'student@test.com',
                role: 'student',
                enrollmentStatus: 'not_enrolled',
                tuitionBalance: 0,
                payments: []
            },
            {
                id: 'admin-1',
                name: 'Admin',
                role: 'admin'
            }
        ];
        localStorage.setItem('school_users', JSON.stringify(mockUsers));

        const mockTuition = {
            rates: [
                { gradeLevel: 'grade-7', amount: 5000 }
            ],
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('tuition_config', JSON.stringify(mockTuition));
    });

    it('should deduct upfront payment from balance upon approval', async () => {
        const { result } = renderHook(() => useStudents());

        const enrollmentData: Partial<EnrollmentFormData> = {
            firstName: 'Test',
            lastName: 'Student',
            gradeLevel: 'grade-7',
            paymentMethod: 'online',
            paymentAmount: 1500,
            paymentStatus: 'completed'
        };

        // 1. Submit enrollment
        act(() => {
            result.current.submitEnrollment('student-1', enrollmentData as EnrollmentFormData);
        });

        // 2. Refresh and verify pending status
        act(() => {
            result.current.refresh();
        });
        let student = result.current.getStudentById('student-1');
        expect(student?.enrollmentStatus).toBe('pending');
        expect(student?.enrollmentData?.paymentAmount).toBe(1500);

        // 3. Approve enrollment
        act(() => {
            result.current.updateStudentStatus('student-1', 'approved');
        });

        // 4. Verify balance deduction and payment history
        // Total Tuition (5000) - Upfront Payment (1500) = 3500
        act(() => {
            result.current.refresh();
        });
        student = result.current.getStudentById('student-1');
        expect(student?.enrollmentStatus).toBe('approved');
        expect(student?.tuitionBalance).toBe(3500);

        // Verify payment history
        expect(student?.payments).toHaveLength(1);
        expect(student?.payments?.[0].amount).toBe(1500);
        expect(student?.payments?.[0].status).toBe('completed');
        expect(student?.payments?.[0].description).toBe('Upfront Enrollment Payment');
    });
});
