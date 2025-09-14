module.exports = {
  // Enable compression for smaller bundle sizes
  compress: true,

  // Optimize images
  images: {
    domains: ["rb.gy", "lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
    formats: ['image/webp', 'image/avif'], // Modern image formats for better compression
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce client-side bundle size
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false
      };
    }
    return config;
  },

  // Enable experimental features for better performance
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
  },

  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};