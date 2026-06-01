import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdfkit', 'qrcode'],
  outputFileTracingIncludes: {
    '/api/generate-pdf': ['./node_modules/pdfkit/**/*', './node_modules/qrcode/**/*'],
  },
};

export default nextConfig;
