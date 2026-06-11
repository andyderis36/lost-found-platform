'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus(data.data.alreadyVerified ? 'already-verified' : 'success');
        setMessage(data.message);
        setEmail(data.data.email);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      alert('Email address not found');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        alert(data.message || 'Failed to resend email');
      }
    } catch {
      alert('An error occurred while resending email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Card className={`shadow-lg border-t-4 ${
          status === 'loading' ? 'border-t-primary' :
          status === 'error' ? 'border-t-destructive' :
          'border-t-green-500'
        }`}>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
              {status === 'loading' && (
                <div className="bg-primary/10 p-4 rounded-full">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}
              {(status === 'success' || status === 'already-verified') && (
                <div className="bg-green-500/10 p-4 rounded-full">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-destructive/10 p-4 rounded-full">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'already-verified' && 'Already Verified'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {message || 'Please wait while we verify your email address...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 pb-2">
            {email && (
              <div className="text-center bg-muted/50 py-2 rounded-lg text-sm text-muted-foreground font-medium">
                {email}
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              {(status === 'success' || status === 'already-verified') && (
                <Link href="/login" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
                  Go to Login
                </Link>
              )}

              {status === 'error' && (
                <>
                  <Button 
                    onClick={handleResendEmail} 
                    disabled={resending || !email} 
                    className="w-full"
                    size="lg"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  
                  <Link href="/register" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
                    Back to Register
                  </Link>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-center border-t border-border pt-6 pb-6 bg-muted/10 mt-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
