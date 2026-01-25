import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EnrollmentsManagement() {
  const { students, updateStudentStatus } = useStudents();
  const { toast } = useToast();

  const pendingStudents = students.filter(s => s.enrollmentStatus === 'pending');

  const handleStatusUpdate = (studentId: string, status: 'approved' | 'rejected') => {
    updateStudentStatus(studentId, status);
    toast({
      title: `Enrollment ${status}`,
      description: `The enrollment has been ${status} successfully.`,
    });
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
              <span className="text-2xl font-bold">
                {students.filter(s => s.enrollmentStatus === 'pending').length}
              </span>
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
              <span className="text-2xl font-bold">
                {students.filter(s => s.enrollmentStatus === 'approved').length}
              </span>
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
              <span className="text-2xl font-bold">
                {students.filter(s => s.enrollmentStatus === 'rejected').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Enrollments</CardTitle>
          <CardDescription>
            {pendingStudents.length} application{pendingStudents.length !== 1 ? 's' : ''} awaiting review
          </CardDescription>
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
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied: {new Date(student.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-row flex-col">
                      <Button
                        variant="outline"
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleStatusUpdate(student.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleStatusUpdate(student.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
