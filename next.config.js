/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable telemetry to prevent trace file generation
  experimental: {
    instrumentationHook: false
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Set output to standalone for better deployment
  output: 'standalone',
  // Enable React Strict Mode
  reactStrictMode: true,
  // Disable powered by header
  poweredByHeader: false,
  // Configure webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // Disable static optimization for now to prevent build issues
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig
