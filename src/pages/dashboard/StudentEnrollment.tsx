import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useEffect, useState } from 'react';
import { Student } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, FileText, User, Users, School } from 'lucide-react';
import EnrollmentWizard from '@/components/enrollment/EnrollmentWizard';

export default function StudentEnrollment() {
  const { user } = useAuth();
  const { getStudentById } = useStudents();
  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    if (user?.id) {
      const data = getStudentById(user.id);
      if (data) setStudentData(data);
    }
  }, [user?.id, getStudentById]);

  // Show enrollment wizard if not enrolled yet
  if (studentData?.enrollmentStatus === 'not_enrolled') {
    return <EnrollmentWizard onSuccess={() => user?.id && setStudentData(getStudentById(user.id) || null)} />;
  }

  const getStatusContent = () => {
    switch (studentData?.enrollmentStatus) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-16 w-16 text-success" />,
          title: 'Enrollment Approved!',
          description: 'Congratulations! Your enrollment has been approved. You are now officially enrolled at EduPortal Academy.',
          color: 'border-success',
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          title: 'Enrollment Not Approved',
          description: 'Unfortunately, your enrollment application was not approved at this time. Please contact the admissions office for more information.',
          color: 'border-destructive',
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-warning" />,
          title: 'Enrollment Under Review',
          description: 'Your enrollment application has been submitted and is currently under review. We will notify you once a decision has been made.',
          color: 'border-warning',
        };
    }
  };

  const statusContent = getStatusContent();
  const enrollmentData = studentData?.enrollmentData;

  const formatGradeLevel = (grade: string) => {
    return grade?.replace('grade-', 'Grade ') || 'Not specified';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Enrollment Status</h2>
        <p className="text-muted-foreground">View your enrollment application status</p>
      </div>

      <Card className={`border-2 ${statusContent.color}`}>
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            {statusContent.icon}
            <h3 className="mt-4 text-xl font-semibold">{statusContent.title}</h3>
            <p className="mt-2 text-muted-foreground max-w-md">{statusContent.description}</p>
            {studentData?.enrollmentSubmittedAt && (
              <p className="mt-4 text-sm text-muted-foreground">
                Submitted on {new Date(studentData.enrollmentSubmittedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show enrollment details if submitted */}
      {enrollmentData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your submitted personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Full Name</dt>
                  <dd className="font-medium">{enrollmentData.firstName} {enrollmentData.lastName}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd className="font-medium">
                    {enrollmentData.dateOfBirth ? new Date(enrollmentData.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{enrollmentData.phone}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="font-medium">{studentData?.email}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Address</dt>
                  <dd className="font-medium">
                    {enrollmentData.address}, {enrollmentData.city}, {enrollmentData.state} {enrollmentData.zipCode}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>Educational background</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Previous School</dt>
                  <dd className="font-medium">{enrollmentData.primarySchool}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Applying for Grade</dt>
                  <dd className="font-medium">{formatGradeLevel(enrollmentData.gradeLevel)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guardian Information
              </CardTitle>
              <CardDescription>Parent/Guardian details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Primary Guardian</dt>
                  <dd className="font-medium">{enrollmentData.guardianName}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Relationship</dt>
                  <dd className="font-medium capitalize">{enrollmentData.guardianRelationship}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Guardian Phone</dt>
                  <dd className="font-medium">{enrollmentData.guardianPhone}</dd>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Guardian Email</dt>
                  <dd className="font-medium">{enrollmentData.guardianEmail}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Documents
              </CardTitle>
              <CardDescription>Your submitted documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Birth Certificate</span>
                  </div>
                  <span className="text-sm font-medium text-success">{enrollmentData.birthCertificate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Primary School Grades</span>
                  </div>
                  <span className="text-sm font-medium text-success">{enrollmentData.primarySchoolGrades}</span>
                </div>
                {enrollmentData.additionalDocuments && enrollmentData.additionalDocuments.length > 0 && (
                  <>
                    {enrollmentData.additionalDocuments.map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Additional Document</span>
                        </div>
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enrollment fee payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {enrollmentData.paymentMethod === 'online' ? 'Online Payment (GCash)' : 'Pay at School Office'}
                    </p>
                    {enrollmentData.paymentMethod === 'online' && enrollmentData.paymentReceipt && (
                      <p className="text-xs text-primary font-medium mt-1">
                        Receipt: {enrollmentData.paymentReceiptName || 'Uploaded'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Status</p>
                    <span className={`text-sm ${enrollmentData.paymentStatus === 'completed' ? 'text-success' : 'text-warning'
                      }`}>
                      {enrollmentData.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
