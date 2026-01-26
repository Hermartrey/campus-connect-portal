import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User, FileText, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Student } from '@/types/auth';

export default function EnrollmentsManagement() {
  const { students, updateStudentStatus } = useStudents();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pendingStudents = students.filter(s => s.enrollmentStatus === 'pending' && s.enrollmentData);

  const handleStatusUpdate = (studentId: string, status: 'approved' | 'rejected') => {
    updateStudentStatus(studentId, status);
    toast({
      title: `Enrollment ${status}`,
      description: `The enrollment has been ${status} successfully.`,
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatGradeLevel = (grade: string) => grade?.replace('grade-', 'Grade ') || 'N/A';

  const renderStudentDetails = (student: Student) => {
    const data = student.enrollmentData;
    if (!data) return null;

    return (
      <div className="mt-4 pt-4 border-t space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Date of Birth</p>
            <p className="font-medium">{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{data.phone}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Grade Level</p>
            <p className="font-medium">{formatGradeLevel(data.gradeLevel)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Previous School</p>
            <p className="font-medium">{data.primarySchool}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Guardian</p>
            <p className="font-medium">{data.guardianName} ({data.guardianRelationship})</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-muted-foreground">Guardian Contact</p>
            <p className="font-medium">{data.guardianPhone}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded md:col-span-3">
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{data.address}, {data.city}, {data.state} {data.zipCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Documents: {data.birthCertificate}, {data.primarySchoolGrades}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment: {data.paymentMethod === 'online' ? 'Paid Online' : 'Will Pay Onsite'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Enrollment Management</h2>
        <p className="text-muted-foreground">Review and process enrollment applications</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{pendingStudents.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{students.filter(s => s.enrollmentStatus === 'approved').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{students.filter(s => s.enrollmentStatus === 'rejected').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Enrollments</CardTitle>
          <CardDescription>{pendingStudents.length} application{pendingStudents.length !== 1 ? 's' : ''} awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending enrollments.</p>
          ) : (
            <div className="space-y-4">
              {pendingStudents.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{student.enrollmentData?.firstName} {student.enrollmentData?.lastName}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {student.enrollmentSubmittedAt ? new Date(student.enrollmentSubmittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(student.id)}>
                        {expandedId === student.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        Details
                      </Button>
                      <Button variant="outline" className="text-success hover:bg-success/10" onClick={() => handleStatusUpdate(student.id, 'approved')}>
                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                      </Button>
                      <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(student.id, 'rejected')}>
                        <XCircle className="h-4 w-4 mr-2" />Reject
                      </Button>
                    </div>
                  </div>
                  {expandedId === student.id && renderStudentDetails(student)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
