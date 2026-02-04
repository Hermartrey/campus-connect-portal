import { useState, useEffect } from 'react';
import { EnrollmentFormData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, ArrowLeft, Send, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTuition } from '@/hooks/useTuition';

interface StepPaymentProps {
  data: Partial<EnrollmentFormData>;
  onUpdate: (data: Partial<EnrollmentFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepPayment({ data, onUpdate, onBack, onSubmit }: StepPaymentProps) {
  const { getTuitionForGrade } = useTuition();
  const gradeTuition = getTuitionForGrade(data.gradeLevel || '');

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>(data.paymentMethod || 'onsite');
  const [paymentAmount, setPaymentAmount] = useState<string>(data.paymentAmount?.toString() || '500');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentMethodChange = (value: 'online' | 'onsite') => {
    setPaymentMethod(value);
    onUpdate({ paymentMethod: value });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const validateAmount = (value: string): boolean => {
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amount < 500) {
      setError('Minimum upfront payment is $500');
      return false;
    }
    if (amount > gradeTuition) {
      setError(`Maximum payment cannot exceed total tuition of $${gradeTuition.toLocaleString()}`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount(paymentAmount)) return;

    if (paymentMethod === 'online' && !receipt) {
      setError('Please upload a proof of payment screenshot');
      return;
    }

    setIsProcessing(true);

    let receiptBase64 = '';
    if (receipt) {
      try {
        receiptBase64 = await convertToBase64(receipt);
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }

    const amount = parseFloat(paymentAmount);

    // Simulate payment processing for online payment
    if (paymentMethod === 'online') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpdate({
        paymentMethod: 'online',
        paymentAmount: amount,
        paymentStatus: 'completed',
        paymentReceipt: receiptBase64,
        paymentReceiptName: receipt?.name,
      });
    } else {
      onUpdate({
        paymentMethod: 'onsite',
        paymentAmount: amount,
        paymentStatus: 'pending',
      });
    }

    onSubmit();
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Upfront Payment
          </CardTitle>
          <CardDescription>
            Enter the amount you wish to pay upfront for your enrollment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Tuition ({data.gradeLevel})</span>
              <span className="text-xl font-semibold">${gradeTuition.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Upfront Payment Amount ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="500"
                  max={gradeTuition}
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    validateAmount(e.target.value);
                  }}
                  className={`pl-7 ${error ? 'border-destructive' : ''}`}
                  placeholder="500.00"
                />
              </div>
              {error ? (
                <p className="text-xs text-destructive font-medium">{error}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Minimum: $500 | Maximum: ${gradeTuition.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => handlePaymentMethodChange(value as 'online' | 'onsite')}
              className="space-y-3"
            >
              <div
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                onClick={() => handlePaymentMethodChange('online')}
              >
                <RadioGroupItem value="online" id="online" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    Pay Online Now (GCash)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay securely via GCash
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'onsite' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                onClick={() => handlePaymentMethodChange('onsite')}
              >
                <RadioGroupItem value="onsite" id="onsite" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="onsite" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-5 w-5" />
                    Pay Onsite
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay at the school office during business hours
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* GCash Payment Form */}
          {paymentMethod === 'online' && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">GCash Details</h4>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">GCash Number:</span>
                  <span className="font-bold">09123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">GCash Name:</span>
                  <span className="font-bold">Immaculate Conception High School</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Receipt / Screenshot</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                  required={paymentMethod === 'online'}
                />
                {receipt && (
                  <p className="text-xs text-muted-foreground font-medium">
                    Selected: {receipt.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Please upload a proof of payment to proceed with your enrollment application.
                </p>
              </div>


            </div>
          )}

          {/* Onsite Payment Info */}
          {paymentMethod === 'onsite' && (
            <Alert className="bg-muted/50">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Onsite Payment Instructions:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Visit the school office at 123 Education Ave</li>
                  <li>Office hours: Mon-Fri, 8:00 AM - 5:00 PM</li>
                  <li>Accepted: Cash, Check, Credit/Debit Card</li>
                  <li>Payment must be completed within 7 days of enrollment approval</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Terms and Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-medium text-success">Ready to Submit</p>
              <p className="text-sm text-muted-foreground">
                By submitting, you confirm that all information provided is accurate and complete.
                Your application will be reviewed by the admissions team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isProcessing || !!error}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Enrollment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

