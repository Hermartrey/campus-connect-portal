import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Wallet, ArrowUpDown, Eye } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function FinancialStatus() {
    const { students } = useStudents();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
    const [balanceFilter, setBalanceFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        // Only show ENROLLED (approved) students
        const isEnrolled = student.enrollmentStatus === 'approved';

        const paymentStatus = student.enrollmentData?.paymentStatus || 'pending';
        const matchesPaymentStatus = paymentStatusFilter === 'all' || paymentStatus === paymentStatusFilter;

        const balance = student.tuitionBalance || 0;
        let matchesBalance = true;
        if (balanceFilter === 'has_balance') {
            matchesBalance = balance > 0;
        } else if (balanceFilter === 'paid_off') {
            matchesBalance = balance === 0;
        }

        return isEnrolled && matchesSearch && matchesPaymentStatus && matchesBalance;
    });

    // Sort students
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];

        // Handle nested properties if needed, or specific fields
        if (sortConfig.key === 'paymentStatus') {
            aValue = a.enrollmentData?.paymentStatus || 'pending';
            bValue = b.enrollmentData?.paymentStatus || 'pending';
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 hover:bg-green-600';
            case 'pending':
                return 'bg-yellow-500 hover:bg-yellow-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Status</h2>
                    <p className="text-muted-foreground">Manage student tuition balances and payment statuses</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Student Financial Overview</CardTitle>
                            <CardDescription>
                                Total Students: {students.length}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-8 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Balance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Balances</SelectItem>
                                    <SelectItem value="has_balance">With Outstanding Balance</SelectItem>
                                    <SelectItem value="paid_off">Fully Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1">
                                            Student Name
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                                        <div className="flex items-center gap-1">
                                            Email
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('gradeLevel')}>
                                        <div className="flex items-center gap-1">
                                            Grade Level
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('tuitionBalance')}>
                                        <div className="flex items-center gap-1">
                                            Balance
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('paymentStatus')}>
                                        <div className="flex items-center gap-1">
                                            Payment Status
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell className="capitalize">
                                                {student.gradeLevel?.replace('-', ' ') || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-medium">
                                                    <span className="text-muted-foreground font-normal">₱</span>
                                                    {student.tuitionBalance?.toLocaleString() || '0'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(student.enrollmentData?.paymentStatus)}>
                                                    {(student.enrollmentData?.paymentStatus || 'pending').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/dashboard/students/${student.id}?edit=true`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View & Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DollarSignIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
