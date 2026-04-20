/**
 * Next.js Config
 * Configurações de segurança e performance
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuração para Vercel (Híbrido por padrão)
  // Remova 'output: export' se precisar de SSR ou API Routes reais no futuro.
  output: 'standalone',
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // React strict mode
  reactStrictMode: true,

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Turbopack root fix
  // @ts-ignore
  turbopack: {
    root: './',
  },
};

export default nextConfig;
