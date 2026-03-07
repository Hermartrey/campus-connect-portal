import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, DollarSign, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const { students } = useStudents();

  const stats = {
    totalStudents: students.length,
    approved: students.filter(s => s.enrollmentStatus === 'approved').length,
    pending: students.filter(s => s.enrollmentStatus === 'pending').length,
    totalPayments: students.reduce((acc, s) =>
      acc + (s.payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0), 0
    ),
    totalOutstanding: students.reduce((acc, s) => acc + (s.tuitionBalance || 0), 0),
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      description: 'Registered students',
      color: 'text-primary'
    },
    {
      title: 'Payments',
      value: `₱${stats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total collected',
      color: 'text-success'
    },
    {
      title: 'Outstanding',
      value: `₱${stats.totalOutstanding.toLocaleString()}`,
      icon: Wallet,
      description: 'Total balance',
      color: 'text-destructive'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-warning'
    },
  ];

  const recentStudents = students.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Students</CardTitle>
          <CardDescription>Latest student registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No students registered yet.</p>
          ) : (
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.enrollmentStatus === 'approved'
                    ? 'bg-success/10 text-success'
                    : student.enrollmentStatus === 'rejected'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-warning/10 text-warning'
                    }`}>
                    {student.enrollmentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
