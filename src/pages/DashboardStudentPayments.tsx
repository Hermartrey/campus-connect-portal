import DashboardLayout from '@/components/DashboardLayout';
import StudentPayments from './dashboard/StudentPayments';

export default function DashboardStudentPayments() {
  return (
    <DashboardLayout>
      <StudentPayments />
    </DashboardLayout>
  );
}
