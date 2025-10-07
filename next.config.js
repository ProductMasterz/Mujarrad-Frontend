/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
