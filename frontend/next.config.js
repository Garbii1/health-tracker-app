// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Recommended for development checks
    // swcMinify: true, // Enable SWC minifier for faster builds
  
    // Optional: Add configuration for images if loading from external domains
    // images: {
    //   domains: ['example.com'], // Add domains you load images from
    // },
  
    // Optional: Base path if deploying to a subdirectory (not needed for Vercel root deploy)
    // basePath: '/my-app',
  
    // Optional: Set up rewrites, redirects, headers if needed
    // async redirects() {
    //   return [
    //     {
    //       source: '/old-page',
    //       destination: '/new-page',
    //       permanent: true,
    //     },
    //   ]
    // },
  }
  
  module.exports = nextConfig