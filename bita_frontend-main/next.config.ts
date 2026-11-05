import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.*.*',
    '192.168.1.112',
    '192.168.1.112:3000',
    '10.*.*.*',
  ],
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
};

export default nextConfig;
