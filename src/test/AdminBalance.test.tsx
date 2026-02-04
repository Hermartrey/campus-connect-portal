import { renderHook, act } from '@testing-library/react';
import { useStudents } from '../hooks/useStudents';

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

describe('useStudents - Admin Balance Management', () => {
    beforeEach(() => {
        localStorage.clear();
        const mockUsers = [
            {
                id: 'student-1',
                name: 'Test Student',
                email: 'student@test.com',
                role: 'student',
                enrollmentStatus: 'approved',
                tuitionBalance: 5000,
                payments: []
            }
        ];
        localStorage.setItem('school_users', JSON.stringify(mockUsers));
    });

    it('should allow admin to update student balance', () => {
        const { result } = renderHook(() => useStudents());

        // 1. Verify initial balance
        let student = result.current.getStudentById('student-1');
        expect(student?.tuitionBalance).toBe(5000);

        // 2. Update balance to 2500
        act(() => {
            result.current.updateTuitionBalance('student-1', 2500);
        });

        // 3. Refresh and verify update
        act(() => {
            result.current.refresh();
        });
        student = result.current.getStudentById('student-1');
        expect(student?.tuitionBalance).toBe(2500);

        // 4. Verify persistence in localStorage
        const savedUsers = JSON.parse(localStorage.getItem('school_users') || '[]');
        expect(savedUsers[0].tuitionBalance).toBe(2500);
    });
});
