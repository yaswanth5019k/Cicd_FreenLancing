/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8080/api',
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist': isServer ? false : 'pdfjs-dist/build/pdf',
    };
    return config;
  },
};

module.exports = nextConfig; 