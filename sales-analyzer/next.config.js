/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['your-supabase-domain.supabase.co'],
    },
    experimental: {
      serverComponentsExternalPackages: ['@supabase/supabase-js'],
    },
  }
  
  module.exports = nextConfig