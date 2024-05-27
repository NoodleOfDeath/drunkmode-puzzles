/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: false,
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.module.rules.push({ test: /\.node$/, use: 'node-loader' });
    }
    return config;
  },
};

module.exports = nextConfig;
