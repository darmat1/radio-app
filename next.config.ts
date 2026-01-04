import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure image domains and patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'http', 
        hostname: 'i.ibb.co',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    unoptimized: false
  },
  // Security headers to allow HTTP audio streams
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Upgrade-Insecure-Requests',
            value: '1'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
