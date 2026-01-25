import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useEffect, useState } from 'react';
import { Student } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

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
          title: 'Enrollment Pending',
          description: 'Your enrollment application is currently under review. We will notify you once a decision has been made.',
          color: 'border-warning',
        };
    }
  };

  const statusContent = getStatusContent();

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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
          </CardTitle>
          <CardDescription>Your submitted enrollment information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Full Name</dt>
              <dd className="font-medium">{studentData?.name || user?.name}</dd>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium">{studentData?.email || user?.email}</dd>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Application Date</dt>
              <dd className="font-medium">
                {studentData?.createdAt 
                  ? new Date(studentData.createdAt).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">{studentData?.enrollmentStatus || 'pending'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
