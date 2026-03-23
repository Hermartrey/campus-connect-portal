import { useState } from 'react';
import { useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const navigate = useNavigate();
  const { verifyCode } = useAuth();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If no email is provided in the URL, redirect to login
  if (!emailParam) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit verification code.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const result = await verifyCode(emailParam, code);
    
    if (result.success) {
      toast({
        title: 'Account verified!',
        description: 'Welcome back.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Verification failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md text-center">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Link to="/">
                <img src="/ichs-logo.png" alt="ICHS Logo" className="h-12 w-12 object-contain" />
              </Link>
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="mt-2 text-sm">
              We've sent a 6-digit verification code to <span className="font-semibold">{emailParam}</span>. Please enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 text-left">
               <Label htmlFor="code">Verification Code</Label>
               <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Only allow digits
                  required
                  className="text-center text-2xl tracking-widest h-14 font-mono"
               />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>
            <p className="text-sm text-muted-foreground">
              Didn't receive a code? Check your spam folder or return to <Link to="/signup" className="text-primary hover:underline">sign up</Link>.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
