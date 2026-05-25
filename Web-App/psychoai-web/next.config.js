/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // suppresses hydration warnings in dev
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

module.exports = nextConfig;