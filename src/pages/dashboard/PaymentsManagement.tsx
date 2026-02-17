import { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, Clock, CheckCircle, Eye, Download, FileText, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function PaymentsManagement() {
  const { students, confirmPayment, cancelPayment } = useStudents();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [confirmingPayment, setConfirmingPayment] = useState<{
    studentId: string;
    paymentId: string;
    amount: number;
    studentName: string;
  } | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{
    receipt: string;
    receiptName?: string;
  } | null>(null);
  const [cancelingPayment, setCancelingPayment] = useState<{
    studentId: string;
    paymentId: string;
    amount: number;
    studentName: string;
  } | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const handleConfirmPayment = () => {
    if (confirmingPayment) {
      confirmPayment(confirmingPayment.studentId, confirmingPayment.paymentId);
      addNotification({
        userId: confirmingPayment.studentId,
        title: 'Payment Confirmed',
        message: `Your payment of $${confirmingPayment.amount.toLocaleString()} has been confirmed.`,
        type: 'success',
      });
      toast({
        title: 'Payment confirmed',
        description: `Payment of $${confirmingPayment.amount.toLocaleString()} has been processed.`,
      });
      setConfirmingPayment(null);
    }
  };

  const handleCancelPayment = () => {
    if (cancelingPayment) {
      cancelPayment(cancelingPayment.studentId, cancelingPayment.paymentId);
      addNotification({
        userId: cancelingPayment.studentId,
        title: 'Payment Cancelled',
        message: `Your payment of $${cancelingPayment.amount.toLocaleString()} has been cancelled by the admin.`,
        type: 'error',
      });
      toast({
        title: 'Payment cancelled',
        description: `Payment of $${cancelingPayment.amount.toLocaleString()} has been cancelled.`,
        variant: 'destructive',
      });
      setCancelingPayment(null);
    }
  };

  const handleDownloadReceipt = (receiptBase64: string, fileName: string) => {
    // Extract MIME type to ensure correct extension
    const mimeMatch = receiptBase64.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : '';

    let finalFileName = fileName || 'receipt';

    // Map common MIME types to extensions
    const extensionMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    };

    // Add extension if it's missing and we have a MIME type match
    const currentExtension = finalFileName.includes('.') ? finalFileName.split('.').pop()?.toLowerCase() : '';
    const suggestedExtension = extensionMap[mimeType];

    if (suggestedExtension && currentExtension !== suggestedExtension.substring(1)) {
      if (!finalFileName.toLowerCase().endsWith(suggestedExtension)) {
        finalFileName += suggestedExtension;
      }
    }

    const link = document.createElement('a');
    link.href = receiptBase64;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Collect all payments from all students
  const allPayments = students.flatMap(student =>
    (student.payments || []).map(payment => ({
      ...payment,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
    }))

  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter Logic
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter.start) {
      matchesDate = matchesDate && new Date(payment.date) >= new Date(dateFilter.start);
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(payment.date) <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalCollected = allPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => {
      if (p.type === 'adjustment') {
        return p.adjustmentType === 'debit' ? sum - p.amount : sum + p.amount;
      }
      return sum + p.amount;
    }, 0);

  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = students.reduce((sum, s) => sum + (s.tuitionBalance || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payments Management</h2>
        <p className="text-muted-foreground">Track and manage student payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">${totalCollected.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">${totalPending.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold">{allPayments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All student payment transactions</CardDescription>

          {/* Filters UI */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search student, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Start Date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full md:w-auto"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full md:w-auto"
              />
            </div>
            {(searchTerm || statusFilter !== 'all' || dateFilter.start || dateFilter.end) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter({ start: '', end: '' });
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No payments found matching your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.studentName}</p>
                          <p className="text-xs text-muted-foreground">{payment.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {payment.receipt ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {payment.receiptName || 'receipt'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setViewingReceipt({
                                receipt: payment.receipt,
                                receiptName: payment.receiptName
                              })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownloadReceipt(payment.receipt, payment.receiptName || 'receipt')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : payment.status === 'cancelled'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                          }`}>
                          {payment.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {payment.status === 'pending' && <Clock className="h-3 w-3" />}
                          {payment.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setCancelingPayment({
                                studentId: payment.studentId,
                                paymentId: payment.id,
                                amount: payment.amount,
                                studentName: payment.studentName,
                              })}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setConfirmingPayment({
                                studentId: payment.studentId,
                                paymentId: payment.id,
                                amount: payment.amount,
                                studentName: payment.studentName,
                              })}
                            >
                              Confirm
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmingPayment} onOpenChange={() => setConfirmingPayment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this payment of ${confirmingPayment?.amount.toLocaleString()} from {confirmingPayment?.studentName}?
              <br /><br />
              This will mark the payment as completed and deduct the amount from the student's outstanding balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancellation Dialog */}
      <AlertDialog open={!!cancelingPayment} onOpenChange={() => setCancelingPayment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this payment of ${cancelingPayment?.amount.toLocaleString()} from {cancelingPayment?.studentName}?
              <br /><br />
              This will mark the payment as cancelled. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelPayment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Viewing Receipt Dialog */}
      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
            <DialogDescription>
              {viewingReceipt?.receiptName || 'Payment receipt'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-muted rounded-lg overflow-hidden">
            {viewingReceipt?.receipt.startsWith('data:image/') ? (
              <img
                src={viewingReceipt.receipt}
                alt="Receipt"
                className="max-w-full h-auto object-contain shadow-sm"
              />
            ) : viewingReceipt?.receipt.startsWith('data:application/pdf') ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <FileText className="h-16 w-16 text-primary" />
                <p className="text-sm font-medium">PDF Document</p>
                <Button onClick={() => handleDownloadReceipt(viewingReceipt.receipt, viewingReceipt.receiptName || 'receipt.pdf')}>
                  Download to View
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                <Button className="mt-4" onClick={() => handleDownloadReceipt(viewingReceipt?.receipt || '', viewingReceipt?.receiptName || 'receipt')}>
                  Download anyway
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
