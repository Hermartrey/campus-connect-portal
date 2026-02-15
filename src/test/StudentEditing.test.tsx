import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
        gradeLevel: 'grade-10',
        birthCertificate: 'birth_cert.pdf',
        primarySchoolGrades: 'grades.pdf'
    }
};

// Mock hooks
vi.mock('@/hooks/useStudents', () => ({
    useStudents: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(),
}));

describe('Student Details Editing', () => {
    const mockUpdateStudentData = vi.fn();
    const mockUpdateTuitionBalance = vi.fn();
    const mockGetStudentById = vi.fn();
    const mockToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetStudentById.mockReturnValue(MOCK_STUDENT);
        (useStudents as any).mockReturnValue({
            getStudentById: mockGetStudentById,
            updateStudentData: mockUpdateStudentData,
            updateTuitionBalance: mockUpdateTuitionBalance,
        });
        (useToast as any).mockReturnValue({ toast: mockToast });
    });

    it('should toggle edit mode and save changes', async () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/students/student-123']}>
                <Routes>
                    <Route path="/dashboard/students/:id" element={<StudentDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Initial State: View Mode
        await waitFor(() => {
            expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        });
        expect(screen.queryByPlaceholderText('Address')).not.toBeInTheDocument();

        // Enter Edit Mode
        fireEvent.click(screen.getByText('Edit Profile'));

        // Check for Cancel and Save buttons
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();

        // Inputs should be visible (checking one for brevity)
        // Note: The specific implementation renders inputs where values were text
        // We can assume inputs are present if we can find them by value or place
        // In our implementation, we used key-value display turned into inputs.
        // Let's look for an input with the phone number
        const phoneInput = screen.getByDisplayValue('555-0000');
        expect(phoneInput).toBeInTheDocument();

        // Make a change
        fireEvent.change(phoneInput, { target: { value: '555-9999' } });

        // Save
        fireEvent.click(screen.getByText('Save Changes'));

        // Verify update called
        expect(mockUpdateStudentData).toHaveBeenCalledWith('student-123', expect.objectContaining({
            phone: '555-9999'
        }));

        // Verify toast
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Student Updated'
        }));
    });

    it('should handle document viewing and updating', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/dashboard/students/student-123']}>
                <Routes>
                    <Route path="/dashboard/students/:id" element={<StudentDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Initial State: View Mode - Documents present
        await waitFor(() => {
            expect(screen.getByText('birth_cert.pdf')).toBeInTheDocument();
        });

        // Enter Edit Mode
        fireEvent.click(screen.getByText('Edit Profile'));

        // Check for File Input using the label or strict structure if possible.
        // We rendered <Input type="file" />. 
        // Let's find inputs with type file.
        const fileInputs = container.querySelectorAll('input[type="file"]');
        expect(fileInputs.length).toBeGreaterThan(0);

        // Simulate uploading a file for birthCertificate
        // We know the first one corresponds to birthCertificate in our layout or we can assume order.
        // Or we can find by associated text if we had labels correctly associated.
        // In the component, we have text "Birth Certificate" right before. 
        // For this test, choosing the first file input is a reasonable heuristic for the first document.
        const birthCertInput = fileInputs[0];

        if (birthCertInput) {
            const file = new File(['(content)'], 'new_birth_cert.pdf', { type: 'application/pdf' });
            fireEvent.change(birthCertInput, { target: { files: [file] } });
        }

        // Save
        fireEvent.click(screen.getByText('Save Changes'));

        // Verify update called with new filename
        expect(mockUpdateStudentData).toHaveBeenCalledWith('student-123', expect.objectContaining({
            birthCertificate: 'new_birth_cert.pdf'
        }));
    });
});
