/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    // Proxy all /api requests to the backend server
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    console.log('Next.js rewrites configured to proxy /api/* to:', backendUrl);

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
