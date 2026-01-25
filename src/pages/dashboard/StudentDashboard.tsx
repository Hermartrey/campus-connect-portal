import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentById } = useStudents();
  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    if (user?.id) {
      const data = getStudentById(user.id);
      if (data) setStudentData(data);
    }
  }, [user?.id, getStudentById]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success';
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome, {user?.name}!</h2>
        <p className="text-muted-foreground">Here's your student dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Enrollment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrollment Status
            </CardTitle>
            {getStatusIcon(studentData?.enrollmentStatus || 'pending')}
          </CardHeader>
          <CardContent>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(studentData?.enrollmentStatus || 'pending')}`}>
              {studentData?.enrollmentStatus || 'pending'}
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              {studentData?.enrollmentStatus === 'approved' 
                ? 'Your enrollment has been approved!'
                : studentData?.enrollmentStatus === 'rejected'
                ? 'Please contact the office for more information.'
                : 'Your application is under review.'}
            </p>
          </CardContent>
        </Card>

        {/* Tuition Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tuition Balance
            </CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${studentData?.tuitionBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {studentData?.tuitionBalance && studentData.tuitionBalance > 0 
                ? 'Payment due'
                : 'All paid up!'}
            </p>
          </CardContent>
        </Card>

        {/* Payments Made */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments Made
            </CardTitle>
            <FileText className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentData?.payments?.filter(p => p.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: ${studentData?.payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link to="/dashboard/enrollment">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View Enrollment
            </Button>
          </Link>
          <Link to="/dashboard/my-payments">
            <Button className="gap-2">
              <CreditCard className="h-4 w-4" />
              Make Payment
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {!studentData?.payments?.length ? (
            <p className="text-muted-foreground text-center py-8">No payments made yet.</p>
          ) : (
            <div className="space-y-4">
              {studentData.payments.slice(-5).reverse().map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${payment.amount.toLocaleString()}</p>
                    <span className={`text-xs ${
                      payment.status === 'completed' ? 'text-success' : 'text-warning'
                    }`}>
                      {payment.status}
                    </span>
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
