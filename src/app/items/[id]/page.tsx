'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ImageCropper from '@/components/ImageCropper';
import { compressBase64Image } from '@/lib/imageCompression';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, ArrowLeft, Loader2, Download, Copy, ExternalLink, Edit, Trash2, Camera, MapPin, Clock, Plus, X, Phone, Mail, User, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Item {
  _id: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  qrCodeDataUrl: string;
  image?: string;
  imageUrl?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface Scan {
  id: string;
  scannerName: string;
  scannerEmail?: string;
  scannerPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  scannedAt: string;
}

const CATEGORY_OPTIONS = [
  'Electronics',
  'Personal Items',
  'Bags & Luggage',
  'Jewelry',
  'Documents',
  'Keys',
  'Sports Equipment',
  'Other',
];

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [item, setItem] = useState<Item | null>(null);
  // state for fullscreen image preview
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', category: '', description: '', status: '' });
  const [editCustomFields, setEditCustomFields] = useState<Array<{ id: string; key: string; value: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Image Crop State
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && itemId) {
      fetchItemDetails();
      fetchScans();
    }
  }, [user, itemId]);

  const fetchItemDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch item details');
      }

      const data = await response.json();
      setItem(data.data);
      
      setEditData({
        name: data.data.name || '',
        category: data.data.category || '',
        description: data.data.description || '',
        status: data.data.status || '',
      });
      
      if (data.data.customFields && typeof data.data.customFields === 'object') {
        const entries = Object.entries(data.data.customFields as Record<string, unknown>);
        setEditCustomFields(entries.map(([k, v], i) => ({ id: String(Date.now()) + i, key: k, value: String(v ?? '') })));
      } else {
        setEditCustomFields([]);
      }
    } catch (err) {
      setError('Failed to load item details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/scans/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScans(data.data.scans || []);
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err);
      setScans([]);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download QR code');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item?.qrCode}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Failed to download QR code');
    }
  };

  const handleSaveItem = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          category: editData.category,
          description: editData.description,
          status: editData.status,
          customFields: editCustomFields && editCustomFields.length > 0
            ? Object.fromEntries(editCustomFields.filter(f => f.key).map(f => [f.key, f.value]))
            : undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to save item');
      }

      await fetchItemDetails();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete item');

      router.push('/dashboard');
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleAddCustomField = () => {
    setEditCustomFields(prev => [...prev, { id: String(Date.now()) + Math.random().toString(36).slice(2,7), key: '', value: '' }]);
  };

  const handleRemoveCustomField = (id: string) => {
    setEditCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleCustomFieldChange = (id: string, field: 'key' | 'value', value: string) => {
    setEditCustomFields(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const openEditModal = () => {
    if (item) {
      setEditData({
        name: item.name,
        category: item.category,
        description: item.description,
        status: item.status,
      });
      if (item.customFields && typeof item.customFields === 'object') {
        const entries = Object.entries(item.customFields as Record<string, unknown>);
        setEditCustomFields(entries.map(([k, v], i) => ({ id: String(Date.now()) + i, key: k, value: String(v ?? '') })));
      } else {
        setEditCustomFields([]);
      }
      setIsEditModalOpen(true);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !item) {
    return null;
  }

  const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${item.qrCode}`;

  return (
    <div className="min-h-screen bg-muted/30 pt-16 pb-24">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">


        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - QR & Actions */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <Card className="shadow-sm relative">
              <div className="absolute top-3 left-3 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" 
                  onClick={() => {
                    if (user?.role === 'admin') {
                      router.back();
                    } else {
                      router.push('/dashboard');
                    }
                  }}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Attach this to your item</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-border mb-4 shadow-sm">
                  {item.qrCodeDataUrl ? (
                    <Image
                      src={item.qrCodeDataUrl}
                      alt={`QR Code for ${item.name}`}
                      width={200}
                      height={200}
                      className="w-full h-auto"
                    />
                  ) : (
                    <Skeleton className="w-[200px] h-[200px]" />
                  )}
                </div>
                <Badge variant="outline" className="font-mono text-sm px-3 py-1 mb-6 bg-muted">
                  {item.qrCode}
                </Badge>
                
                <Button className="w-full gap-2 mb-6" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4" />
                  Download QR
                </Button>

                <div className="w-full pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Public Link</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share this link or scan the QR code to view the public page
                  </p>
                  
                  <div className="flex gap-2 mb-3">
                    <Input 
                      readOnly 
                      value={publicLink} 
                      className="font-mono text-xs text-muted-foreground bg-muted/50"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        navigator.clipboard.writeText(publicLink);
                        alert('Link copied to clipboard!');
                      }}
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 text-primary bg-primary/10 hover:bg-primary/20"
                    onClick={() => window.open(publicLink, '_blank')}
                  >
                    Open Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Item Details & History */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="px-5 py-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <CardTitle className="text-xl font-bold break-words">{item.name}</CardTitle>
                    <CardDescription className="text-sm mt-1 flex items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-muted-foreground">
                        Added on {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={item.status === 'active' ? 'destructive' : item.status === 'found' ? 'default' : 'secondary'}
                    className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${item.status === 'found' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  >
                    {item.status === 'active' ? 'Lost' : item.status === 'found' ? 'Found' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Image Area & Action */}
                  <div className="md:col-span-4 flex flex-col items-center gap-3">
                    <div className="w-full aspect-square max-w-[200px] relative rounded-xl overflow-hidden border border-border shadow-sm bg-muted flex flex-col items-center justify-center cursor-pointer" onClick={() => setIsImagePreviewOpen(true)}>
                      {item.image || item.imageUrl ? (
                        <Image
                          src={item.image ?? item.imageUrl ?? ''}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-3 text-center">
                          <Camera className="w-10 h-10 opacity-30 mb-1.5" />
                          <span className="text-xs font-medium">No Image Uploaded</span>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full max-w-[200px] gap-2 text-xs h-8" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-3.5 h-3.5" />
                      {item.image || item.imageUrl ? 'Update Photo' : 'Upload Photo'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setImageToCrop(ev.target?.result as string);
                            setIsEditImageModalOpen(true);
                          };
                          reader.readAsDataURL(file);
                        }
                        if (e.target) e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Right Column: Description & Custom Fields */}
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Description
                      </h3>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                        {item.description}
                      </p>
                    </div>

                    {item.customFields && Object.keys(item.customFields).length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Additional Details
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(item.customFields).map(([key, value]) => (
                            <div key={key} className="bg-muted/30 p-2.5 rounded-lg border border-border/50 flex flex-col">
                              <span className="text-xs font-semibold text-muted-foreground mb-0.5">{key}</span>
                              <span className="text-sm font-medium text-foreground break-all">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons (Desktop only - below all content) */}
                    <div className="hidden md:flex gap-2">
                      <Button size="sm" onClick={openEditModal} className="gap-1.5 text-xs h-8">
                        <Edit className="w-3.5 h-3.5" />
                        Edit Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDeleteItem} className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 gap-1.5 text-xs h-8">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Item
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-5 py-3 bg-muted/30 border-t border-border flex md:hidden justify-center gap-2">
                <Button size="sm" onClick={openEditModal} className="flex-1 sm:flex-none gap-1.5 text-xs h-8">
                  <Edit className="w-3.5 h-3.5" />
                  Edit Details
                </Button>
                <Button size="sm" variant="outline" onClick={handleDeleteItem} className="flex-1 sm:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 gap-1.5 text-xs h-8">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Item
                </Button>
              </CardFooter>
            </Card>

            {/* Scan History Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Scan History <Badge variant="secondary" className="ml-2">{scans.length}</Badge>
                </CardTitle>
                <CardDescription>People who have scanned your item&apos;s QR code</CardDescription>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-foreground">No scans yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">When someone scans this item, it will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scans.map((scan) => (
                      <div key={scan.id} className="border border-border rounded-xl p-4 sm:p-5 hover:border-primary/30 transition-colors shadow-sm bg-card">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                          <div>
                            <h4 className="font-semibold text-base flex items-center gap-2">
                              {scan.scannerName}
                            </h4>
                            <div className="mt-2 space-y-1">
                              {scan.scannerEmail && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 break-all">
                                  <Mail className="w-3.5 h-3.5" />
                                  {scan.scannerEmail}
                                </p>
                              )}
                              {scan.scannerPhone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5" />
                                  {scan.scannerPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1.5 whitespace-nowrap bg-muted/50">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </Badge>
                        </div>

                        {scan.location && (
                          <div className="bg-muted/30 p-3 rounded-lg mt-3 border border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Location
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${scan.location.latitude},${scan.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                            >
                              {scan.location.address || `${scan.location.latitude}, ${scan.location.longitude}`}
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        )}

                        {scan.message && (
                          <div className="bg-muted/30 p-3 rounded-lg mt-3 border border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" /> Message
                            </p>
                            <p className="text-sm italic text-foreground leading-relaxed break-words border-l-2 border-primary/30 pl-2">
                              &ldquo;{scan.message}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Modal using Shadcn Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item Details</DialogTitle>
              <DialogDescription>
                Make changes to your item. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editData.name} 
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editData.category} 
                  onValueChange={(v) => setEditData(prev => ({ ...prev, category: v ?? '' }))}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  rows={4}
                  value={editData.description} 
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editData.status} 
                  onValueChange={(v) => setEditData(prev => ({ ...prev, status: v ?? '' }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Lost (Active)</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2 border-t pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <Label>Additional Details</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField}>
                    <Plus className="w-4 h-4 mr-1" /> Add Field
                  </Button>
                </div>
                {editCustomFields.map(field => (
                  <div key={field.id} className="flex gap-2 items-start mt-2">
                    <Input 
                      placeholder="Name" 
                      value={field.key} 
                      onChange={(e) => handleCustomFieldChange(field.id, 'key', e.target.value)} 
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Value" 
                      value={field.value} 
                      onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)} 
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveItem} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Crop Modal */}
        {isEditImageModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <ImageCropper
                imageSrc={imageToCrop}
                onCropComplete = {async (croppedImage) => {
                  try {
                    const compressedBase64 = await compressBase64Image(croppedImage, { maxWidth: 1000, maxHeight: 1000, quality: 0.8, maxSizeKB: 600 });
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/items/${itemId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ image: compressedBase64 }),
                    });

                    if (!response.ok) throw new Error('Failed to upload image');
                    
                    await fetchItemDetails();
                    setIsEditImageModalOpen(false);
                    setImageToCrop('');
                  } catch {
                    alert('Failed to update image');
                  }
                }}
                onCancel={() => {
                  setIsEditImageModalOpen(false);
                  setImageToCrop('');
                }}
              />
            </div>
          </div>
        )}

        {/* Fullscreen Image Preview Modal */}
        {isImagePreviewOpen && (
          <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-background p-0">
              <img
                src={item.image ?? item.imageUrl ?? ''}
                alt={item.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsImagePreviewOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
