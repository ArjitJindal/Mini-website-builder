/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net',
      'cdn.openai.com',
      'images.unsplash.com'
    ],
  },
};

module.exports = nextConfig; 