import { useState, useMemo } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Payment } from '@/types/auth';
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
import { Search, ArrowUpDown, History } from 'lucide-react';
import { format } from 'date-fns';

interface FlatTransaction extends Payment {
    studentId: string;
    studentName: string;
}

export default function TransactionHistory() {
    const { students } = useStudents();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    // Flatten transactions from all students
    const allTransactions: FlatTransaction[] = useMemo(() => {
        return students.flatMap(student => {
            return (student.payments || []).map(payment => ({
                ...payment,
                studentId: student.id,
                studentName: student.name,
                // Ensure type defaults to 'payment' for older records
                type: payment.type || 'payment'
            }));
        });
    }, [students]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(tx =>
            tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allTransactions, searchTerm]);

    // Sort transactions
    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof FlatTransaction];
            let bValue: any = b[sortConfig.key as keyof FlatTransaction];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTransactions, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getTypeColor = (type?: string) => {
        return type === 'adjustment' ? 'bg-orange-500' : 'bg-green-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
                    <p className="text-muted-foreground">Comprehensive record of all financial activities and adjustments.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                All Transactions
                            </CardTitle>
                            <CardDescription>
                                Total Records: {allTransactions.length}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student or description..."
                                    className="pl-8 w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            Date
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('studentName')}>
                                        <div className="flex items-center gap-1">
                                            Student
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                                        <div className="flex items-center gap-1">
                                            Type
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center justify-end gap-1">
                                            Amount
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(tx.date), 'MMM d, yyyy h:mm a')}
                                            </TableCell>
                                            <TableCell>{tx.studentName}</TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(tx.type)}>
                                                    {(tx.type || 'payment').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground w-[40%]">
                                                {tx.description}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₱{tx.amount.toLocaleString()}
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
