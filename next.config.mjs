/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com','lh3.googleusercontent.com'],
    unoptimized: true,
  },
};

export default nextConfig;

