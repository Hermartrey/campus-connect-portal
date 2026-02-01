import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EnrollmentWizard from '@/components/enrollment/EnrollmentWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/hooks/use-toast';

// Mock hooks
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));
vi.mock('@/hooks/useStudents', () => ({
    useStudents: vi.fn(),
}));
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(),
}));

// Mock components to avoid rendering full tree and complex logic
vi.mock('@/components/enrollment/StepDemographics', () => ({
    default: ({ onNext }: any) => <button onClick={onNext}>Next Demo</button>
}));
vi.mock('@/components/enrollment/StepDocuments', () => ({
    default: ({ onNext }: any) => <button onClick={onNext}>Next Docs</button>
}));
vi.mock('@/components/enrollment/StepReview', () => ({
    default: ({ onNext }: any) => <button onClick={onNext}>Next Review</button>
}));
vi.mock('@/components/enrollment/StepPayment', () => ({
    default: ({ onSubmit }: any) => <button onClick={onSubmit}>Submit Payment</button>
}));

describe('EnrollmentWizard', () => {
    const mockSubmitEnrollment = vi.fn();
    const mockToast = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: { id: 'student-123', name: 'Test User' } });
        (useStudents as any).mockReturnValue({ submitEnrollment: mockSubmitEnrollment });
        (useToast as any).mockReturnValue({ toast: mockToast });
    });

    it('should call onSuccess after successful submission', async () => {
        render(<EnrollmentWizard onSuccess={mockOnSuccess} />);

        // Step 1: Demographics
        fireEvent.click(screen.getByText('Next Demo'));

        // Step 2: Documents
        fireEvent.click(screen.getByText('Next Docs'));

        // Step 3: Review
        fireEvent.click(screen.getByText('Next Review'));

        // Step 4: Payment (Submit)
        fireEvent.click(screen.getByText('Submit Payment'));

        await waitFor(() => {
            expect(mockSubmitEnrollment).toHaveBeenCalled();
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
