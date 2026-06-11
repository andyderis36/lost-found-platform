'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Search, Trash2, Eye, Box, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'found' | 'inactive';
  qrCode: string;
  qrCodeDataUrl?: string;
  image?: string;
  imageUrl?: string;
  customFields?: Record<string, string>;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'found' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.data.items || []);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
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

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredItems = items
    .filter(item => {
      // 1. Status Filter
      if (filter !== 'all' && item.status !== filter) return false;
      
      // 2. Search Query (Name/Category/Description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }
      
      // 3. Time Filter
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
    });

  return (
    <div className="min-h-screen bg-muted/30 pt-16 pb-24 relative">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">My Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, <span className="font-semibold text-foreground">{user.name}</span>! Here are your registered items.
            </p>
          </div>
          <Link href="/items/new" className="hidden md:block">
            <Button size="lg" className="gap-2 shadow-sm">
              <Plus className="w-5 h-5" />
              Add New Item
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Box className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{items.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lost Items</CardTitle>
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{items.filter(i => i.status === 'active').length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Found Items</CardTitle>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{items.filter(i => i.status === 'found').length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-muted-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{items.filter(i => i.status === 'inactive').length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Items Section */}
        <div className="space-y-6">
          <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as 'all' | 'active' | 'found' | 'inactive')} className="w-full">
            <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <TabsList className="inline-flex w-full lg:w-auto bg-muted border border-border/50 h-12 p-1.5 gap-1.5">
                  <TabsTrigger 
                    value="all" 
                    className="flex-1 lg:flex-none py-2.5 px-5 text-xs sm:text-sm font-medium rounded-md transition-all data-active:!bg-black data-active:!text-white dark:data-active:!bg-white dark:data-active:!text-black data-active:shadow-sm"
                  >
                    All Items
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active" 
                    className="flex-1 lg:flex-none py-2.5 px-5 text-xs sm:text-sm font-medium rounded-md transition-all data-active:!bg-black data-active:!text-white dark:data-active:!bg-white dark:data-active:!text-black data-active:shadow-sm"
                  >
                    Lost
                  </TabsTrigger>
                  <TabsTrigger 
                    value="found" 
                    className="flex-1 lg:flex-none py-2.5 px-5 text-xs sm:text-sm font-medium rounded-md transition-all data-active:!bg-black data-active:!text-white dark:data-active:!bg-white dark:data-active:!text-black data-active:shadow-sm"
                  >
                    Found
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inactive" 
                    className="flex-1 lg:flex-none py-2.5 px-5 text-xs sm:text-sm font-medium rounded-md transition-all data-active:!bg-black data-active:!text-white dark:data-active:!bg-white dark:data-active:!text-black data-active:shadow-sm"
                  >
                    Inactive
                  </TabsTrigger>
                </TabsList>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search items..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 w-full"
                    />
                  </div>
                  
                  <Select value={timeFilter} onValueChange={(v) => v && setTimeFilter(v as 'all' | 'today' | 'week' | 'month')}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Time Added" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(v) => v && setSortBy(v as 'name' | 'newest' | 'oldest')}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[420px] rounded-xl" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-transparent shadow-none">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {filter === 'all' 
                    ? "You haven't added any items yet. Start by adding your first item to protect it."
                    : `You don't have any items with the "${filter}" status.`
                  }
                </p>
                {filter === 'all' && (
                  <Link href="/items/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Item
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden group flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    {/* Image Area */}
                    <div className="p-3 bg-muted/30 flex-shrink-0">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center p-8 bg-background/50">
                            <Card className="p-4 shadow-sm bg-white border-none flex items-center justify-center">
                              {item.qrCodeDataUrl ? (
                                <Image
                                  src={item.qrCodeDataUrl}
                                  alt={`QR Code`}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Box className="w-16 h-16 text-muted-foreground opacity-20" />
                              )}
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center gap-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1 flex-1">
                          {item.name}
                        </CardTitle>
                        <Badge variant={
                          item.status === 'active' ? 'destructive' :
                          item.status === 'found' ? 'default' : 'secondary'
                        } className={item.status === 'found' ? 'bg-green-500 hover:bg-green-600 shrink-0' : 'shrink-0'}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1 font-medium">{item.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 flex-1">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-muted-foreground gap-2">
                          <Box className="w-4 h-4 shrink-0" />
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs truncate max-w-[200px]">{item.qrCode}</code>
                        </div>
                        <div className="flex items-center text-muted-foreground gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mt-2">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                    
                    {/* Actions */}
                    <CardFooter className="pt-3 gap-2">
                      <Link href={`/items/${item.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full bg-primary/5 hover:bg-primary/15 text-primary">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Link href="/items/new">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-xl">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
