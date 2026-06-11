'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBase64SizeKB, compressBase64Image } from '@/lib/imageCompression';
import Image from 'next/image';
import ImageCropper from '@/components/ImageCropper';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowLeft, Loader2, Plus, X, Upload, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CATEGORIES = [
  'Electronics',
  'Personal Items',
  'Bags & Luggage',
  'Jewelry',
  'Documents',
  'Keys',
  'Sports Equipment',
  'Other',
];

export default function NewItemPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const customFieldsObj: Record<string, string> = {};
      customFields.forEach(field => {
        if (field.key && field.value) {
          customFieldsObj[field.key] = field.value;
        }
      });

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      router.push(`/items/${data.data.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-16 pb-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Register New Item
          </h1>
          <p className="text-muted-foreground text-lg">
            Add your item details below. A unique QR code will be generated automatically.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro, MacBook Air, Leather Wallet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value ?? '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about your item (color, model, distinguishing features, etc.)"
                  className="resize-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Item Photo <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Upload a photo of your item (JPEG, PNG). You can crop it to 1:1 ratio.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <label htmlFor="image" className={cn(buttonVariants({ variant: 'outline' }), 'relative cursor-pointer')}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setImageToCrop(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              } catch (error) {
                                setError('Failed to read image. Please try a different image.');
                              }
                            }
                          }}
                        />
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {imagePreview ? 'Image selected' : 'No file chosen'}
                    </span>
                  </div>
                </div>

                {imagePreview && (
                  <div className="bg-muted/50 p-4 rounded-xl inline-block border border-border">
                    <div className="w-40 h-40 relative rounded-lg overflow-hidden border border-border bg-background">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground font-mono">
                        {getBase64SizeKB(imagePreview)}KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Additional Details <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <p className="text-xs text-muted-foreground mt-1">Add custom fields like Serial Number, Brand, etc.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </Button>
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                          placeholder="Name (e.g. Serial)"
                          className="flex-1"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomField(index)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Alert className="bg-primary/5 border-primary/20 text-foreground">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>What happens next</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Once you submit, a unique QR code will be generated for your item. You can then download and print this QR code to attach to your item.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-6">
                <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="mr-2 h-4 w-4" />
                      Create Item & Generate QR
                    </>
                  )}
                </Button>
                <Link href="/dashboard" className="w-full sm:w-32">
                  <Button variant="outline" size="lg" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {imageToCrop && (
          <ImageCropper
            imageSrc={imageToCrop}
            onCropComplete={async (croppedImage) => {
              try {
                const compressedBase64 = await compressBase64Image(
                  croppedImage,
                  { maxWidth: 800, maxHeight: 800, quality: 0.8, maxSizeKB: 500 }
                );
                
                setFormData({ ...formData, image: compressedBase64 });
                setImagePreview(compressedBase64);
                setImageToCrop('');
              } catch (error) {
                setError('Failed to process image. Please try again.');
                setImageToCrop('');
              }
            }}
            onCancel={() => {
              setImageToCrop('');
              const fileInput = document.getElementById('image') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
          />
        )}
      </main>
    </div>
  );
}

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}
