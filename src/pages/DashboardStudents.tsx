import DashboardLayout from '@/components/DashboardLayout';
import StudentsManagement from './dashboard/StudentsManagement';

export default function DashboardStudents() {
  return (
    <DashboardLayout>
      <StudentsManagement />
    </DashboardLayout>
  );
}
