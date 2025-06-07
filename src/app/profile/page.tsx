
"use client";

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserCircle2, Mail, LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, signIn, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground text-lg">Loading Profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <UserCircle2 className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4 text-primary-foreground">Access Your Profile</h1>
        <p className="text-lg text-foreground/80 mb-8 max-w-md">
          Sign in with your Google account to view your AstroVerse profile and manage your preferences.
        </p>
        <Button onClick={signIn} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="text-center py-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="font-headline text-4xl font-bold mb-4 text-primary-foreground">My AstroProfile</h1>
      </section>
      
      <Card className="bg-card shadow-xl border border-border rounded-xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4 ring-2 ring-accent ring-offset-4 ring-offset-background">
            <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
            <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-3xl text-accent-foreground">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground flex items-center justify-center">
            <Mail className="h-4 w-4 mr-2" /> {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
            <p className="text-base text-foreground/90 p-3 bg-input rounded-md border border-border break-all">{user.id}</p>
          </div>
          
          {user.googleId && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Google ID</h3>
              <p className="text-base text-foreground/90 p-3 bg-input rounded-md border border-border break-all">{user.googleId}</p>
            </div>
          )}

          {/* Placeholder for future profile settings */}
          <div className="pt-4 border-t border-border">
            <h3 className="font-headline text-xl text-primary-foreground mb-3">Preferences & Settings</h3>
            <p className="text-muted-foreground text-sm">
              Future settings for event notifications, display preferences, and linked accounts will appear here.
            </p>
          </div>
          
          <Button onClick={signOut} variant="destructive" className="w-full mt-6">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
