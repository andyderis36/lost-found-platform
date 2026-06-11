'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Menu, LogOut, LayoutDashboard, PlusCircle, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavLinksProps {
  mobile?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  pathname: string;
  onLinkClick?: () => void;
}

const NavLinks = ({ mobile = false, user, pathname, onLinkClick }: NavLinksProps) => {
  return (
    <>
      {user ? (
        <>
          <Link href="/dashboard" className="w-full" onClick={() => onLinkClick?.()}>
            <Button variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} className={`w-full justify-start ${!mobile && 'w-auto'}`}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          {user.role === 'admin' && (
            <Link href="/admin" className="w-full" onClick={() => onLinkClick?.()}>
              <Button variant={pathname === '/admin' ? 'secondary' : 'ghost'} className={`w-full justify-start ${!mobile && 'w-auto'}`}>
                <ShieldAlert className="w-4 h-4 mr-2 text-destructive" />
                Admin
              </Button>
            </Link>
          )}
          
          <Link href="/items/new" className="w-full" onClick={() => onLinkClick?.()}>
            <Button className={`w-full justify-start ${!mobile && 'w-auto'}`}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" className="w-full" onClick={() => onLinkClick?.()}>
            <Button variant="ghost" className={`w-full justify-start ${!mobile && 'w-auto'}`}>
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-full" onClick={() => onLinkClick?.()}>
            <Button className={`w-full justify-start ${!mobile && 'w-auto'}`}>
              Get Started
            </Button>
          </Link>
        </>
      )}
    </>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/scan/')) {
    return null;
  }



  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ${
      scrolled ? 'border-border shadow-sm' : 'border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Theme Toggle */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative inline-flex items-center justify-center rounded-full p-[4px] shadow-[0_0_10px_rgba(255,0,60,0.45),_0_0_10px_rgba(0,229,255,0.35)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
                <div className="relative bg-background rounded-full p-1 z-10 flex items-center justify-center">
                  <Image
                    src="/logos/logo-black.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 transform transition-transform group-hover:scale-105 dark:invert rounded-full"
                  />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:inline">
                Lost & Found
              </span>
            </Link>

            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-lg"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-all animate-[pulse_3s_infinite]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700 transition-all" />
                )}
              </Button>
            ) : (
              <div className="h-9 w-9 rounded-lg bg-muted animate-pulse"></div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {!mounted ? (
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <NavLinks user={user} pathname={pathname} />
                
                {user && (
                  <div className="ml-2 pl-4 border-l border-border flex items-center gap-4">
                    <NotificationCenter />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full" />
                      }>
                        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                          <AvatarImage src="/JoniNeversleep.jpeg" />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && user && <NotificationCenter />}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-4 p-6">
                <SheetHeader className="text-left p-0">
                  <SheetTitle className="flex items-center gap-2 mt-4 mb-2">
                    <div className="relative inline-flex items-center justify-center rounded-full p-[3.5px] shadow-[0_0_10px_rgba(255,0,60,0.45),_0_0_10px_rgba(0,229,255,0.35)]">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#00e5ff] to-[#ff003c] animate-[spin_2s_linear_infinite] rounded-full"></div>
                      <div className="relative bg-background rounded-full p-1 z-10 flex items-center justify-center">
                        <Image src="/logos/logo-black.png" alt="Logo" width={16} height={16} className="h-4 w-4 dark:invert rounded-full" />
                      </div>
                    </div>
                    <span>Lost & Found</span>
                  </SheetTitle>
                </SheetHeader>
                
                {mounted && user && (
                  <div className="flex items-center gap-3 px-3 py-3 bg-muted/50 rounded-xl mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/JoniNeversleep.jpeg" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <NavLinks mobile user={user} pathname={pathname} onLinkClick={() => setIsMobileOpen(false)} />
                  
                  {mounted && user && (
                    <>
                      <div className="my-2 h-px bg-border" />
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          logout();
                          setIsMobileOpen(false);
                        }} 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
