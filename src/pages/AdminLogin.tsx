import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success && result.user) {
            if (result.user.role === 'admin') {
                toast({
                    title: 'Welcome back, Admin!',
                    description: 'You have successfully signed in.',
                });
                navigate('/dashboard');
            } else {
                // Log out immediately if not admin
                logout();
                toast({
                    title: 'Access Denied',
                    description: 'This portal is for administrators only.',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Sign in failed',
                description: result.error || 'Invalid credentials',
                variant: 'destructive',
            });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md border-primary/20 shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <Link to="/" className="flex items-center justify-center gap-2 mb-2">
                        <img src="/ichs-logo.png" alt="ICHS Logo" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-bold text-foreground">ICHS</span>
                    </Link>
                    <div className="flex justify-center mb-2">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Admin Portal</CardTitle>
                    <CardDescription>Sign in to manage the system</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@school.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In as Admin
                        </Button>
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Go to Student Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
