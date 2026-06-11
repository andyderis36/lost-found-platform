'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Search, SearchX, BarChart3, Users2, LayoutDashboard, Clock, Tag, Box, ArrowRight, Loader2, ShieldAlert, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Stats {
  users: {
    total: number;
    regular: number;
    admins: number;
  };
  items: {
    total: number;
    active: number;
    found: number;
    inactive: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  scans: {
    total: number;
    perDay: Array<{ date: string; count: number }>;
    recent: Array<{
      id: string;
      scannerName: string;
      item: { name: string; qrCode: string } | null;
      scannedAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchStats();
      }
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      setStats(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium text-lg">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 w-full mt-8">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Platform statistics and system management.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/50 bg-gradient-to-br from-card to-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Manage Users</CardTitle>
                  <CardDescription>View, edit, and delete accounts</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/items" className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/50 bg-gradient-to-br from-card to-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Manage Items</CardTitle>
                  <CardDescription>View and manage all items</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard" className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/50 bg-gradient-to-br from-card to-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">User Dashboard</CardTitle>
                  <CardDescription>Switch back to user view</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-xl">
                <Users2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Users</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stats?.users.total || 0}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.users.admins || 0} admins</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-orange-500/10 text-orange-600 rounded-xl">
                <Box className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Items</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stats?.items.total || 0}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.items.active || 0} active (lost)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-500/10 text-green-600 rounded-xl">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Found Items</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stats?.items.found || 0}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">successfully recovered</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 text-blue-600 rounded-xl">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Scans</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stats?.scans.total || 0}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">all time QR scans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Items by Category */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" /> Items by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats?.items.byCategory.map((cat) => (
                  <div key={cat.category} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> {cat.category}
                    </p>
                    <p className="text-2xl font-bold">{cat.count}</p>
                  </div>
                ))}
                {(!stats?.items.byCategory || stats.items.byCategory.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No items found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.scans.recent && stats.scans.recent.length > 0 ? (
                <div className="space-y-4">
                  {stats.scans.recent.map((scan) => (
                    <div key={scan.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">{scan.scannerName}</p>
                        {scan.item && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Box className="w-3.5 h-3.5" />
                            {scan.item.name} <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded ml-1">{scan.item.qrCode}</span>
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                  <SearchX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No scans recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
