
"use client";

import type { User, AuthState } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthState & { signIn: () => void; signOut: () => void } | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true to check existing session
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Placeholder: Check for existing session (e.g., from localStorage or a cookie)
    // In a real app, you'd verify this session with your backend or Google
    const storedUser = localStorage.getItem('astroverse-user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('astroverse-user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    // Placeholder for Google Sign-In logic
    // This would typically involve using the Google Identity Services library
    try {
      // Simulate successful sign-in
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      const mockUser: User = {
        id: 'mock-google-user-123',
        name: 'Astro Explorer',
        email: 'astro.explorer@example.com',
        image: 'https://placehold.co/100x100/7B62FF/FFFFFF.png?text=AE',
        googleId: 'mock-google-id',
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('astroverse-user', JSON.stringify(mockUser));
      toast({
        title: 'Signed In',
        description: `Welcome back, ${mockUser.name}!`,
      });
    } catch (err) {
      console.error('Google Sign-In error (placeholder):', err);
      setError('Failed to sign in with Google.');
      toast({
        title: 'Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    // Placeholder for Google Sign-Out logic
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('astroverse-user');
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (err) {
      console.error('Google Sign-Out error (placeholder):', err);
      setError('Failed to sign out.');
       toast({
        title: 'Sign-Out Failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
