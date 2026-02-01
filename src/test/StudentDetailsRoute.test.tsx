import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StudentsManagement from '@/pages/dashboard/StudentsManagement';
import StudentDetails from '@/pages/dashboard/StudentDetails';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';

// Mock content
const MOCK_STUDENT = {
    id: 'student-123',
    name: 'Test Student',
    email: 'test@example.com',
    enrollmentStatus: 'approved',
    createdAt: new Date().toISOString(),
    enrollmentData: {
        firstName: 'Test',
        lastName: 'Student',
        phone: '555-0000',
        primarySchool: 'Test School',
        gradeLevel: 'grade-10'
    }
};

// Mock hooks
vi.mock('@/hooks/useStudents', () => ({
    useStudents: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(),
}));

describe('Student Details Route', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useStudents as any).mockReturnValue({
            students: [MOCK_STUDENT],
            getStudentById: (id: string) => id === MOCK_STUDENT.id ? MOCK_STUDENT : undefined,
        });
        (useToast as any).mockReturnValue({ toast: vi.fn() });
    });

    it('should navigate to details page when clicking a student row', () => {
        // We can't easily mock the internal navigate of Router in this integration style without more setup
        // So we'll test the components independently in a MemoryRouter

        render(
            <MemoryRouter initialEntries={['/dashboard/students']}>
                <Routes>
                    <Route path="/dashboard/students" element={<StudentsManagement />} />
                    <Route path="/dashboard/students/:id" element={<StudentDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Find and click the student row
        const studentRow = screen.getByText('Test Student').closest('tr');
        expect(studentRow).toBeInTheDocument();

        if (studentRow) {
            fireEvent.click(studentRow);
        }

        // Check if details are rendered
        expect(screen.getByText('Student Profile')).toBeInTheDocument();
        expect(screen.getByText('Test Student (test@example.com)')).toBeInTheDocument();
        expect(screen.getByText('Test School')).toBeInTheDocument();

        // Check for Guardian Info
        expect(screen.getByText('Guardian Information')).toBeInTheDocument();

        // Check for Documents
        expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
    });
});
