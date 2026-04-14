import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { EnrollmentFormData } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import StepDemographics from './StepDemographics';
import StepDocuments from './StepDocuments';
import StepReview from './StepReview';
import StepPayment from './StepPayment';
import StepAcademicInfo from './StepAcademicInfo';

const NEW_STUDENT_STEPS = [
  { id: 1, title: 'Personal Info', description: 'Demographics & Guardian' },
  { id: 2, title: 'Documents', description: 'Upload Required Files' },
  { id: 3, title: 'Review', description: 'Verify Information' },
  { id: 4, title: 'Payment', description: 'Enrollment Fee' },
];

const RETURNING_STUDENT_STEPS = [
  { id: 1, title: 'Academic Info', description: 'Grade Level & Strand' },
  { id: 2, title: 'Payment', description: 'Enrollment Fee' },
];

interface EnrollmentWizardProps {
  onSuccess?: () => void;
  isReturning?: boolean;
}

export default function EnrollmentWizard({ onSuccess, isReturning = false }: EnrollmentWizardProps) {
  const { user } = useAuth();
  const { submitEnrollment, getStudentById } = useStudents();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EnrollmentFormData>>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    paymentMethod: 'onsite',
  });

  // Pre-fill data for returning students
  useEffect(() => {
    if (isReturning && user?.id) {
      const student = getStudentById(user.id);
      if (student?.enrollmentData) {
        setFormData(prev => ({
          ...prev,
          ...student.enrollmentData,
          // Clear grade level/strand to force re-selection
          gradeLevel: undefined,
          strand: undefined,
        }));
      }
    }
  }, [isReturning, user?.id]);

  const steps = isReturning ? RETURNING_STUDENT_STEPS : NEW_STUDENT_STEPS;
  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (data: Partial<EnrollmentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (latestData?: Partial<EnrollmentFormData>) => {
    if (!user?.id) return;

    // Merge the latest data (from StepPayment) with formData
    const finalData = latestData
      ? { ...formData, ...latestData }
      : formData;

    await submitEnrollment(user.id, finalData as EnrollmentFormData);
    addNotification({
      userId: 'admin-1',
      title: isReturning ? 'Returning Student Enrollment' : 'New Enrollment Application',
      message: `${finalData.firstName} ${finalData.lastName} has submitted an enrollment application for grade ${finalData.gradeLevel}.`,
      type: 'info',
      link: '/dashboard/enrollments',
    });
    toast({
      title: 'Enrollment Submitted!',
      description: 'Your application has been submitted for review.',
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {isReturning ? 'Returning Student Enrollment' : 'Student Enrollment'}
        </h2>
        <p className="text-muted-foreground">
          {isReturning
            ? 'Welcome back! Please select your new grade level to proceed.'
            : 'Complete the form below to enroll at Immaculate Conception High School'}
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className={`grid ${isReturning ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={step.id > currentStep}
                className={`flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${step.id === currentStep
                  ? 'bg-primary/10 border-2 border-primary'
                  : step.id < currentStep
                    ? 'bg-success/10 cursor-pointer hover:bg-success/20'
                    : 'bg-muted/50 cursor-not-allowed opacity-60'
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.id < currentStep
                    ? 'bg-success text-success-foreground'
                    : step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {!isReturning ? (
        // NEW STUDENT FLOW
        <>
          {currentStep === 1 && (
            <StepDemographics
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepDocuments
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepReview
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              goToStep={goToStep}
            />
          )}
          {currentStep === 4 && (
            <StepPayment
              data={formData}
              onUpdate={updateFormData}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </>
      ) : (
        // RETURNING STUDENT FLOW
        <>
          {currentStep === 1 && (
            <StepAcademicInfo
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepPayment
              data={formData}
              onUpdate={updateFormData}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </>
      )}
    </div>
  );
}
