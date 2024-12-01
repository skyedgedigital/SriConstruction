/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk'],
  },
  images: {
    domains: ['firebasestorage.googleapis.com'], // Add this line
  },
};
export default nextConfig;
