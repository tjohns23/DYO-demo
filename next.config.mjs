/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure Tailwind CSS is properly processed
    config.optimization = config.optimization || {};
    config.optimization.minimize = true;
    return config;
  },
  experimental: {
    cssOptimization: true,
  },
}

export default nextConfig
