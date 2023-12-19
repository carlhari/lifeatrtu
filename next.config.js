/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    SECRET_KEY: process.env.SECRET_KEY,
    SENTIMENT_URL: process.env.SENTIMENT_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
