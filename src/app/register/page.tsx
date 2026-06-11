'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2, MailWarning } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-destructive' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 pt-24 pb-12 md:py-20">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (Desktop Welcome Section) */}
        <div className="md:col-span-6 flex flex-col items-center text-center space-y-2 md:pr-4">
          <Link href="/">
            <div className="relative inline-flex items-center justify-center rounded-full p-[4px] shadow-[0_0_12px_rgba(255,0,60,0.5),_0_0_12px_rgba(0,229,255,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
              <div className="relative bg-background rounded-full p-2.5 z-10 flex items-center justify-center">
                <Image
                  src="/logos/logo-black.png"
                  alt="Lost & Found Platform Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 dark:invert rounded-full"
                />
              </div>
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome to Lost & Found
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your ultimate peace of mind. Register your items, attach unique QR codes, and recover what matters most to you easily and securely.
            </p>
          </div>
        </div>

        {/* Right Column (Registration Card) */}
        <div className="md:col-span-6 w-full max-w-md mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
                    <p className="text-sm text-muted-foreground">
                      We sent a verification link to <span className="font-medium text-foreground">{formData.email}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-muted text-sm text-left flex gap-3">
                    <MailWarning className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">Can&apos;t find the email?</p>
                      <p className="text-muted-foreground">Check your spam or junk folder. Mark it as &quot;Not Spam&quot; to ensure future deliveries.</p>
                    </div>
                  </div>

                  <Link href="/login" className="block">
                    <Button className="w-full">Return to Login</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Joni Neversleep"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joni_neversleep@gmail.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow">
                      <PhoneInput
                        international
                        defaultCountry="ID"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                        className="w-full outline-none [&_input]:bg-transparent [&_input]:outline-none [&_input]:border-none [&_.PhoneInputCountry]:mr-2"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground select-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {formData.password && (
                    <p className={`text-xs mt-1 font-medium ${passwordStrength.color}`}>
                      Strength: {passwordStrength.strength}
                    </p>
                  )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground select-none"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              )}
            </CardContent>
            
            {!success && (
              <CardFooter className="flex justify-center border-t p-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            )}
          </Card>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
