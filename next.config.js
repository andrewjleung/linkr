/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: "/collections",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
