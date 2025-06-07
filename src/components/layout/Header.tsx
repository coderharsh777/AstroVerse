
"use client";

import Link from 'next/link';
import { Rocket, UserCircle, Wallet, LogIn, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className="text-foreground hover:text-accent-foreground hover:bg-accent/20" onClick={onClick}>
      {children}
    </Button>
  </Link>
);

export default function Header() {
  const { address, connectWallet, disconnectWallet, loading: walletLoading } = useWallet();
  const { user, isAuthenticated, signIn, signOut, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/wallet", label: "My Wallet" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2 font-headline text-2xl font-bold text-accent">
          <Rocket className="h-7 w-7" />
          <span>AstroVerse</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map(item => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}
        </nav>

        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} disabled={authLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signIn} disabled={authLoading} variant="outline" className="hidden md:inline-flex border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
          )}

          {address ? (
            <Button onClick={disconnectWallet} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Wallet className="mr-2 h-4 w-4" />
              {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
            </Button>
          ) : (
            <Button onClick={connectWallet} disabled={walletLoading} className="bg-primary hover:bg-primary/90">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map(item => (
                    <NavLink key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </NavLink>
                  ))}
                  <div className="pt-4 border-t border-border">
                  {!isAuthenticated && (
                     <Button onClick={() => {signIn(); setMobileMenuOpen(false);}} disabled={authLoading} variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In with Google
                      </Button>
                  )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
