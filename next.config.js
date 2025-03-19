/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configs
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
  // Enable custom 404 page
  notFound: {
    page: "/page/404/404.js",
  },
};

module.exports = nextConfig;
