'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchX, Loader2, CheckCircle2, ShieldAlert, Mail, User, Phone, Info, MapPin, Send, Lock, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ItemData {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customFields?: Record<string, any>;
  status: string;
}

export default function ScanPage() {
  const params = useParams();
  const qrCode = params?.qrCode as string;
  
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scannerName: '',
    scannerEmail: '',
    scannerPhone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/public/${qrCode}`);
        const data = await response.json();
        
        if (data.success) {
          setItem(data.data);
        } else {
          setError('Item not found. This QR code may be invalid or deactivated.');
        }
      } catch {
        setError('Failed to load item. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchItem();
    }
  }, [qrCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let location = undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 8000,
              maximumAge: 0,
              enableHighAccuracy: false,
            });
          });

          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch {
          console.log('[SCAN FORM] Location unavailable or denied');
        }
      }

      const payload = {
        qrCode,
        scannerName: formData.scannerName?.trim() || '',
        scannerEmail: formData.scannerEmail?.trim() || '',
        scannerPhone: formData.scannerPhone?.trim() || '',
        message: formData.message?.trim() || '',
        location,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseText = await response.text();
      let data;
      try { data = JSON.parse(responseText); } catch { throw new Error('Invalid server response'); }

      if (response.ok && data?.success === true) {
        setSubmitting(false);
        setSubmitted(true);
      } else {
        setSubmitting(false);
        setError(data?.error || `Server error: ${response.status}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.name === 'AbortError' ? 'Request timeout' : err.message || 'Network error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium text-lg">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Item Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-green-500/20 shadow-lg animate-in fade-in zoom-in duration-500">
          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your message has been sent. The owner will contact you soon. We appreciate your honesty!
            </p>
            <Button onClick={() => window.location.reload()} size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white">
              Scan Another Item
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-6 pb-16 px-4 flex flex-col justify-center">
      <div className="w-full max-w-2xl md:max-w-5xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Logo */}
        <div className={`flex justify-center ${item?.status !== 'inactive' ? 'md:hidden' : ''}`}>
          <div className="relative inline-flex items-center justify-center rounded-full p-[3px] shadow-[0_0_10px_rgba(255,0,60,0.45),_0_0_10px_rgba(0,229,255,0.35)] bg-background">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
            <div className="relative bg-background rounded-full p-2 z-10 flex items-center justify-center">
              <Image
                src="/logos/logo-black.png"
                alt="Platform Logo"
                width={27}
                height={27}
                className="h-[27px] w-[27px] dark:invert rounded-full"
              />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${item?.status !== 'inactive' ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'} gap-6 items-stretch`}>
          {/* Item Card */}
          <Card className="overflow-hidden shadow-md flex flex-col h-full">
            {item?.image && (
              <div className="p-4 bg-card pb-0 flex justify-center">
                <div 
                  className="w-full aspect-square md:aspect-[4/3] relative bg-muted rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl font-bold break-words">{item?.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-medium bg-muted/50">{item?.category}</Badge>
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    item?.status === 'active' ? 'destructive' :
                    item?.status === 'found' ? 'default' : 'secondary'
                  }
                  className={`px-4 py-1.5 text-sm uppercase tracking-wide ${item?.status === 'found' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {item?.status === 'active' ? 'LOST' : 
                   item?.status === 'found' ? 'FOUND' : 
                   item?.status === 'inactive' ? 'INACTIVE' : item?.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1">
              {item?.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50">
                    {item.description}
                  </p>
                </div>
              )}

              {item?.customFields && Object.keys(item.customFields).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Additional Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(item.customFields).map(([key, value]) => (
                      <div key={key} className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">{key}</span>
                        <span className="text-sm font-medium text-foreground break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item?.status === 'active' && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 mt-4">
                  <ShieldAlert className="h-5 w-5" />
                  <AlertTitle className="text-base font-bold">This item is reported as LOST</AlertTitle>
                  <AlertDescription>
                    If you found this item, please fill out the form below to contact the owner.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          {item?.status !== 'inactive' ? (
            <Card className="shadow-md flex flex-col h-full">
              <CardHeader>
                {/* Logo inside Contact Form on Desktop */}
                <div className="flex justify-center hidden md:flex mb-4">
                  <div className="relative inline-flex items-center justify-center rounded-full p-[3px] shadow-[0_0_10px_rgba(255,0,60,0.45),_0_0_10px_rgba(0,229,255,0.35)] bg-background">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
                    <div className="relative bg-background rounded-full p-2 z-10 flex items-center justify-center">
                      <Image
                        src="/logos/logo-black.png"
                        alt="Platform Logo"
                        width={27}
                        height={27}
                        className="h-[27px] w-[27px] dark:invert rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Contact Owner
                </CardTitle>
                <CardDescription>
                  Found this item? Fill in your details and we&apos;ll securely notify the owner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scannerName" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="scannerName"
                      required
                      value={formData.scannerName}
                      onChange={(e) => setFormData({ ...formData, scannerName: e.target.value })}
                      placeholder="Joni Neversleep"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scannerEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" /> Email
                    </Label>
                    <Input
                      id="scannerEmail"
                      type="email"
                      value={formData.scannerEmail}
                      onChange={(e) => setFormData({ ...formData, scannerEmail: e.target.value })}
                      placeholder="joni_neversleep@gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scannerPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                    </Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow">
                      <PhoneInput
                        international
                        defaultCountry="ID"
                        value={formData.scannerPhone}
                        onChange={(value) => setFormData({ ...formData, scannerPhone: value || '' })}
                        className="w-full outline-none [&_input]:bg-transparent [&_input]:outline-none [&_input]:border-none [&_.PhoneInputCountry]:mr-2"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" /> Message <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      placeholder="Where did you find it? Any additional details..."
                      className="resize-none"
                    />
                  </div>

                  <Alert className="bg-primary/5 border-primary/20 text-foreground mt-6">
                    <MapPin className="h-4 w-4 text-primary" />
                    <AlertTitle>Location Sharing</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-sm">
                      When you submit this form, your browser will ask for location permission. We send your current location to the owner to help retrieve the item.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Notify Owner
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Your contact info will only be shared securely with the item owner.
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border border-2 border-dashed shadow-none bg-transparent">
              <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
                <Lock className="w-16 h-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-bold mb-2">Item is Inactive</h3>
                <p className="text-muted-foreground">
                  This item has been marked as inactive by the owner. They are not accepting contact requests at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Preview Overlay */}
      {isPreviewOpen && item?.image && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={item.image}
              alt={item.name}
              width={1200}
              height={1200}
              className="object-contain max-w-full max-h-full rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
