import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WalletProvider } from '@/context/WalletContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'AstroVerse - Explore & Mint Astrophysical NFTs',
  description: 'Mint NFTs representing real or simulated astrophysical events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Note: Next/font handles font loading, direct link tags are not needed with this setup */}
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <WalletProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
