import { useState } from 'react';
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

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Demographics & Guardian' },
  { id: 2, title: 'Documents', description: 'Upload Required Files' },
  { id: 3, title: 'Review', description: 'Verify Information' },
  { id: 4, title: 'Payment', description: 'Enrollment Fee' },
];

interface EnrollmentWizardProps {
  onSuccess?: () => void;
}

export default function EnrollmentWizard({ onSuccess }: EnrollmentWizardProps) {
  const { user } = useAuth();
  const { submitEnrollment } = useStudents();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EnrollmentFormData>>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    paymentMethod: 'onsite',
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (data: Partial<EnrollmentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (latestData?: Partial<EnrollmentFormData>) => {
    if (!user?.id) return;

    // Merge the latest data (from StepPayment) with formData to avoid
    // React's async state update timing issue where onUpdate + onSubmit
    // would submit stale formData missing payment receipt and amount.
    const finalData = latestData
      ? { ...formData, ...latestData }
      : formData;

    submitEnrollment(user.id, finalData as EnrollmentFormData);
    addNotification({
      userId: 'admin-1',
      title: 'New Enrollment Application',
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
        <h2 className="text-2xl font-bold text-foreground">Student Enrollment</h2>
        <p className="text-muted-foreground">Complete the form below to enroll at Immaculate Conception High School</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step) => (
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
    </div>
  );
}
