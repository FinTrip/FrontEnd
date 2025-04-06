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

  images: {
    domains: ["lh3.googleusercontent.com", "kamp.vn"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Cho phép tất cả các hostname
      },
    ],
  },
};

module.exports = nextConfig;
