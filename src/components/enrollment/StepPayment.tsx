import { useState } from 'react';
import { EnrollmentFormData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, ArrowLeft, Send, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepPaymentProps {
  data: Partial<EnrollmentFormData>;
  onUpdate: (data: Partial<EnrollmentFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const ENROLLMENT_FEE = 500;

export default function StepPayment({ data, onUpdate, onBack, onSubmit }: StepPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>(data.paymentMethod || 'onsite');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodChange = (value: 'online' | 'onsite') => {
    setPaymentMethod(value);
    onUpdate({ paymentMethod: value });
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing for online payment
    if (paymentMethod === 'online') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpdate({
        paymentMethod: 'online',
        paymentAmount: ENROLLMENT_FEE,
        paymentStatus: 'completed',
      });
    } else {
      onUpdate({
        paymentMethod: 'onsite',
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
            Enrollment Fee Payment
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method for the enrollment fee
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Enrollment Fee</span>
              <span className="text-2xl font-bold">${ENROLLMENT_FEE.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This fee covers application processing and enrollment registration
            </p>
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
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePaymentMethodChange('online')}
              >
                <RadioGroupItem value="online" id="online" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    Pay Online Now
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay securely with credit or debit card
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'onsite' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
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

          {/* Online Payment Form */}
          {paymentMethod === 'online' && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Card Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a demo. No actual payment will be processed.
                </AlertDescription>
              </Alert>
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
          disabled={isProcessing}
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
