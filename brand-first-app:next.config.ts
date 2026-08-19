/** @type {import('next').NextConfig} */
const nextConfig = {
 reactStrictMode: true,
 experimental: {
   appDir: true,
 },
 transpilePackages: [
   'react',
   'react-dom',
   'react-hot-toast',
   '@heroicons/react',
 ],
 modulePlugins: ['node:experimental/module-registration'],
} as any;

export default nextConfig;