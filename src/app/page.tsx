'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, BellRing, Activity, QrCode, Smartphone, Gift, PlusCircle, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden pt-16">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 sm:pt-7 sm:pb-32">
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Logo and Badge group with tight, centered spacing */}
          <div className="flex flex-col items-center gap-4">
            {/* Logo with Modern Effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative inline-flex items-center justify-center rounded-full p-[5px] shadow-[0_0_15px_rgba(255,0,60,0.5),_0_0_15px_rgba(0,229,255,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
                <div className="relative bg-background rounded-full p-4 z-10 flex items-center justify-center">
                  <Image
                    src="/logos/logo-black.png"
                    alt="Lost & Found Platform Logo"
                    width={84}
                    height={84}
                    className="h-[60px] w-[60px] md:h-[80px] md:w-[80px] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 dark:invert rounded-full"
                    style={{
                      transform: `translateY(${scrollY * 0.1}px)`
                    }}
                  />
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="mt-1">
              v3.0 is now live 🎉
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Never Lose Your{' '}
            <span className="text-primary block sm:inline mt-2 sm:mt-0">
              Valuable Items
            </span>
            {' '}Again
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Register your items with <span className="font-semibold text-foreground">unique QR codes</span>. 
            If lost, anyone who finds them can instantly contact you &mdash; keeping your personal information private.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/items/new" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Add New Item
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-medium">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-medium">Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span className="font-medium">Easy Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-muted/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to protect your valuable items
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <QrCode className="w-6 h-6" />
                </div>
                <CardDescription className="font-bold text-primary mb-1 tracking-wider uppercase text-xs">Step 1</CardDescription>
                <CardTitle className="text-xl">Register Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Add your valuable items with photos and details. Each item gets a unique QR code automatically generated.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <Smartphone className="w-6 h-6" />
                </div>
                <CardDescription className="font-bold text-primary mb-1 tracking-wider uppercase text-xs">Step 2</CardDescription>
                <CardTitle className="text-xl">Attach QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Download and print the QR code sticker. Attach it to your laptop, phone, bag, or any valuable item.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <BellRing className="w-6 h-6" />
                </div>
                <CardDescription className="font-bold text-primary mb-1 tracking-wider uppercase text-xs">Step 3</CardDescription>
                <CardTitle className="text-xl">Get Contacted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  If someone finds your item, they scan the QR code and can contact you directly - no personal info exposed!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with your security and convenience in mind
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-lg">Privacy Protected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">Your contact info stays private until needed</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <BellRing className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-lg">Instant Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">Get notified immediately when someone scans</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <Activity className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-lg">Track Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">See who scanned your item and when</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <Gift className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-lg">100% Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">No hidden fees, completely free to use</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="relative inline-flex items-center justify-center rounded-full p-[3.5px] shadow-[0_0_10px_rgba(255,0,60,0.45),_0_0_10px_rgba(0,229,255,0.35)] bg-background">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
            <div className="relative bg-background rounded-full p-2 z-10 flex items-center justify-center">
              <Image
                src="/logos/logo-black.png"
                alt="Lost & Found Platform Logo"
                width={24}
                height={24}
                className="opacity-80 dark:invert rounded-full"
              />
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            © 2025 Lost & Found Platform.<br />
            ANDYDERIS PUTRA AJI SYABANA - PID154<br />
            Supervised by DR. MOHD NIZAM BIN OMAR
          </p>
        </div>
      </footer>
    </div>
  );
}
