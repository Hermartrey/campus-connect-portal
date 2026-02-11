import DashboardLayout from '@/components/DashboardLayout';
import TransactionHistory from './dashboard/TransactionHistory';

export default function DashboardTransactions() {
    return (
        <DashboardLayout>
            <TransactionHistory />
        </DashboardLayout>
    );
}
