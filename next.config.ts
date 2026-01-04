import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure headers for API routes
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range, User-Agent, Accept, Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
