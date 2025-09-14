/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "userpic.codeforces.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-1.webcatalog.io",
        pathname: "/**",
      },
    ],
  },
 
  experimental: {
    instrumentationHook: false,
    optimizePackageImports: ['lucide-react'],
    middleware: {
      headers: ['authorization'],
    },
  },
  productionBrowserSourceMaps: false,
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
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
};

export default nextConfig;

