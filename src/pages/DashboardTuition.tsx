import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import TuitionManagement from './dashboard/TuitionManagement';

export default function DashboardTuition() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Only admins can access tuition management
    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <DashboardLayout>
            <TuitionManagement />
        </DashboardLayout>
    );
}
