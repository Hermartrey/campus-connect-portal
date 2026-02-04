import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, DollarSign, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

const paymentDescriptions = [
  'Tuition Payment',
  'Registration Fee',
  'Lab Fee',
  'Library Fee',
  'Activity Fee',
  'Other',
];

export default function StudentPayments() {
  const { user } = useAuth();
  const { getStudentById, addPayment, refresh, students } = useStudents();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const convertToJpeg = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Load student data on mount and when students array changes
  useEffect(() => {
    if (user?.id) {
      const data = getStudentById(user.id);
      if (data) setStudentData(data);
    }
  }, [user?.id, students, getStudentById]);

  // Refresh data when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentAmount > (studentData?.tuitionBalance || 0)) {
      toast({
        title: 'Amount exceeds balance',
        description: 'Payment amount cannot exceed your outstanding balance.',
        variant: 'destructive',
      });
      return;
    }

    if (!description) {
      toast({
        title: 'Select payment type',
        description: 'Please select a payment description.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      let receiptBase64: string | undefined = undefined;

      if (receipt) {
        if (receipt.type.startsWith('image/')) {
          receiptBase64 = await convertToJpeg(receipt);
        } else {
          receiptBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(receipt);
          });
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (user?.id) {
        addPayment(user.id, {
          amount: paymentAmount,
          date: new Date().toISOString(),
          status: 'pending',
          description,
          receipt: receiptBase64,
          receiptName: receipt?.type.startsWith('image/')
            ? (receipt.name.split('.')[0] + '.jpg')
            : receipt?.name,
        });

        addNotification({
          userId: 'admin-1',
          title: 'New Payment Submitted',
          message: `${user.name} submitted a payment of $${paymentAmount.toLocaleString()} for ${description}.`,
          type: 'info',
          link: '/dashboard/payments',
        });

        refresh();
        const updatedData = getStudentById(user.id);
        if (updatedData) setStudentData(updatedData);

        toast({
          title: 'Payment submitted!',
          description: `Your payment of $${paymentAmount.toLocaleString()} is pending admin confirmation.`,
        });

        setAmount('');
        setDescription('');
        setReceipt(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process receipt file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>
        <p className="text-muted-foreground">Manage your tuition payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">
                ${studentData?.tuitionBalance?.toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-3xl font-bold">
                ${studentData?.payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      {(studentData?.tuitionBalance || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Make a Payment
            </CardTitle>
            <CardDescription>Pay your tuition fees online</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={studentData?.tuitionBalance || 0}
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Payment Type</Label>
                  <Select value={description} onValueChange={setDescription}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentDescriptions.map((desc) => (
                        <SelectItem key={desc} value={desc}>
                          {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt (Optional)</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {receipt && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {receipt.name}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Submit Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your past payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!studentData?.payments?.length ? (
            <p className="text-muted-foreground text-center py-8">No payment history.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.payments.slice().reverse().map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.description}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : payment.status === 'cancelled'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                          }`}>
                          {payment.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : payment.status === 'cancelled' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {payment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
