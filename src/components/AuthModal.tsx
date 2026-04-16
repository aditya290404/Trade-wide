import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { toast } from 'sonner';
import { Loader2, MailCheck } from 'lucide-react';

interface AuthModalProps {
  children?: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP Flow state
  const [otpView, setOtpView] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");
  
  const { loginState } = useAuth();

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setOtpView(false);
        setRegisteredEmail("");
        setDevOtp("");
      }, 300);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.status === 'success') {
        loginState(res.token, res.data.user);
        toast.success('Welcome back to TradeWide!');
        handleOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.status === 'success') {
        setRegisteredEmail(data.email as string);
        setDevOtp(res.devModeOtp);
        setOtpView(true);
        // Dev Mode Simulation
        toast.success(`OTP: ${res.devModeOtp}`, {
          description: "This is a Dev Mode simulation of the email. Copy the code above.",
          duration: 15000,
          className: "border-primary"
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const otpCode = formData.get('otpCode') as string;

    try {
      const res = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail, otpCode })
      });
      if (res.status === 'success') {
        loginState(res.token, res.data.user);
        toast.success('Email Verified! You received ₹100,000 virtual balance.');
        handleOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail })
      });
      if (res.status === 'success') {
        setDevOtp(res.devModeOtp);
        toast.success(`New OTP Generated: ${res.devModeOtp}`, {
          description: "A new OTP has been simulated.",
          duration: 10000,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button variant="default">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {otpView ? (
             <DialogTitle className="flex items-center gap-2">
               <MailCheck className="h-5 w-5 text-primary" /> 
               Verify Email
             </DialogTitle>
          ) : (
            <DialogTitle>Authentication</DialogTitle>
          )}
          <DialogDescription>
            {otpView 
              ? `We sent a 6-digit confirmation code to ${registeredEmail}. Please enter it below.`
              : "Join TradeWide to manage your paper trading portfolio."}
          </DialogDescription>
        </DialogHeader>

        {otpView ? (
          <form onSubmit={handleVerify} className="space-y-4 pt-4 animate-fade-in">
            <div className="space-y-2 text-center">
              <Label htmlFor="otpCode">6-Digit OTP</Label>
              <Input 
                id="otpCode" 
                name="otpCode" 
                maxLength={6} 
                required 
                className="text-center text-2xl tracking-[0.5em] font-mono h-14" 
                placeholder="------" 
                autoComplete="off"
              />
            </div>
            
            {devOtp && (
              <div className="text-xs font-mono bg-primary/10 text-primary p-3 rounded-md text-center border border-primary/20">
                [Dev Mode] Your verification code is: <span className="font-bold text-sm tracking-widest">{devOtp}</span>
              </div>
            )}
            
            <div className="grid gap-2">
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? 'Verifying...' : 'Verify & Setup Account'}
              </Button>
              <Button type="button" variant="outline" onClick={handleResend} disabled={isLoading} className="w-full">
                Resend OTP
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground cursor-pointer hover:underline" onClick={() => setOtpView(false)}>
              Back to Registration
            </p>
          </form>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" required placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4 h-[350px] overflow-y-auto px-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" name="contactNumber" required placeholder="9876543210" minLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Primary Email</Label>
                    <Input id="register-email" name="email" type="email" required placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="alternateEmail">Alternate Email (Optional)</Label>
                    <Input id="alternateEmail" name="alternateEmail" type="email" placeholder="backup@example.com" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input id="register-password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? 'Processing...' : 'Proceed to Verification'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
