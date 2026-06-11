'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Package, ShieldAlert, User, Clock, QrCode, ArrowLeft, Loader2, Filter, Image as ImageIcon, ExternalLink, Eye } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  image?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Keys', 'Bags', 'Other'];

export default function AdminItems() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'found' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchItems();
      }
    }
  }, [user, authLoading, router]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (userFilter) params.append('userId', userFilter);

      const response = await fetch(`/api/admin/items?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch items');
      }

      setItems(data.data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchItems();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium text-lg">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Item Management</h1>
            <p className="text-muted-foreground">View and manage all items across all users.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Filter className="w-5 h-5 text-primary" /> Item Filters
            </CardTitle>
            <CardDescription>Filter and sort registered items in the system</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Lost (Active)</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Frame</label>
              <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Time Frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner ID</label>
              <Input
                placeholder="Filter by User ID"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="md:col-span-1">
              <Button onClick={handleFilter} className="w-full h-10 font-medium shadow-sm">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <div className="text-sm font-medium text-muted-foreground">
            Showing <span className="text-foreground">{items.length}</span> item{items.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items
            .filter(item => {
              if (timeFilter !== 'all') {
                const itemDate = new Date(item.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - itemDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (timeFilter === 'today' && diffDays > 1) return false;
                if (timeFilter === 'week' && diffDays > 7) return false;
                if (timeFilter === 'month' && diffDays > 30) return false;
              }
              return true;
            })
            .sort((a, b) => {
              if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              if (sortBy === 'name') return a.name.localeCompare(b.name);
              return 0;
            })
            .map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
              {item.image ? (
                <div className="w-full aspect-square relative bg-muted border-b border-border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center border-b border-border">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              
              <CardContent className="flex-1 p-5">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.name}</h3>
                  <Badge 
                    variant={item.status === 'active' ? 'destructive' : item.status === 'found' ? 'default' : 'secondary'}
                    className={`shrink-0 ${item.status === 'found' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                  >
                    {item.status === 'active' ? 'LOST' : item.status === 'found' ? 'FOUND' : 'INACTIVE'}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <span className="font-medium">Category</span>
                    <span className="text-foreground font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <span className="font-medium flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5"/> QR</span>
                    <span className="text-foreground font-mono text-xs">{item.qrCode}</span>
                  </div>
                  {item.owner && (
                    <div className="text-muted-foreground bg-muted/30 p-2 rounded-md mt-2">
                      <span className="font-medium flex items-center gap-1.5 mb-1"><User className="w-3.5 h-3.5"/> Owner</span>
                      <p className="text-foreground font-medium truncate">{item.owner.name}</p>
                      <p className="text-xs truncate">{item.owner.email}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 gap-2">
                <Link href={`/items/${item.id}`} className={cn(buttonVariants({ variant: 'default' }), 'flex-1')}>
                  <Eye className="w-4 h-4 mr-1.5" /> Details
                </Link>
                <Link href={`/scan/${item.qrCode}`} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Public
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-xl font-semibold mb-1">No items found</p>
            <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
}
