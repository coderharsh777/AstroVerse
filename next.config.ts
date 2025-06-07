
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io', // For IPFS gateway
        port: '',
        pathname: '/ipfs/**',
      },
      // Add other image hostnames if needed, e.g., for Google Cloud Storage
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-app-url.com' // Replace with your actual production URL
      : 'http://localhost:9002', // Default for local development
  }
};

export default nextConfig;
