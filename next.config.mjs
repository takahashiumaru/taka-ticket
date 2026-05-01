/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Total payload limit per Server Action invocation.
      // Must comfortably exceed MAX_TOTAL_SIZE_BYTES (20 MB) in src/lib/schema.ts
      // to allow file attachments to pass through.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
