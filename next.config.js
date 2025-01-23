/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      "images.unsplash.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SOCKET_URL: process.env.SOCKET_URL,
  },
  // Ensure trailing slashes are handled consistently
  trailingSlash: false,
  // Improve production performance
  swcMinify: true,
  // Handle WebSocket upgrade
  async headers() {
    return [
      {
        source: "/api/socketio",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 