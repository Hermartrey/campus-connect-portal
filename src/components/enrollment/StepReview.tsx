import { EnrollmentFormData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users, School, FileText, ArrowRight, ArrowLeft, Edit } from 'lucide-react';

interface StepReviewProps {
  data: Partial<EnrollmentFormData>;
  onUpdate: (data: Partial<EnrollmentFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  goToStep: (step: number) => void;
}

export default function StepReview({ data, onNext, onBack, goToStep }: StepReviewProps) {
  const formatGradeLevel = (grade: string) => {
    return grade?.replace('grade-', 'Grade ') || 'Not specified';
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Student's personal details</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => goToStep(1)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Full Name</dt>
              <dd className="font-medium">{data.firstName} {data.lastName}</dd>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Date of Birth</dt>
              <dd className="font-medium">
                {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </dd>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Gender</dt>
              <dd className="font-medium capitalize">{data.gender || 'Not specified'}</dd>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Phone</dt>
              <dd className="font-medium">{data.phone || 'Not specified'}</dd>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Address</dt>
              <dd className="font-medium">
                {data.address}, {data.city}, {data.state} {data.zipCode}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* School Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              School Information
            </CardTitle>
            <CardDescription>Educational background</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => goToStep(1)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Previous School</dt>
              <dd className="font-medium">{data.primarySchool || 'Not specified'}</dd>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Applying for Grade</dt>
              <dd className="font-medium">{formatGradeLevel(data.gradeLevel || '')}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Guardian Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guardian Information
            </CardTitle>
            <CardDescription>Parent/Guardian details</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => goToStep(1)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Primary Guardian</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="font-medium">{data.guardianName || 'Not specified'}</dd>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Relationship</dt>
                <dd className="font-medium capitalize">{data.guardianRelationship || 'Not specified'}</dd>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="font-medium">{data.guardianPhone || 'Not specified'}</dd>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium">{data.guardianEmail || 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          {(data.secondaryGuardianName || data.secondaryGuardianPhone) && (
            <div>
              <h4 className="text-sm font-medium mb-3">Secondary Guardian</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="font-medium">{data.secondaryGuardianName || 'Not specified'}</dd>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{data.secondaryGuardianPhone || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents
            </CardTitle>
            <CardDescription>Required and additional documents</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => goToStep(2)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Birth Certificate</span>
              </div>
              <span className="text-sm font-medium text-success">{data.birthCertificate}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Primary School Grades</span>
              </div>
              <span className="text-sm font-medium text-success">{data.primarySchoolGrades}</span>
            </div>
            {data.additionalDocuments && data.additionalDocuments.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Additional Documents:</p>
                {data.additionalDocuments.map((doc) => (
                  <div key={doc} className="flex items-center gap-2 p-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doc}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button type="button" size="lg" onClick={onNext} className="gap-2">
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
