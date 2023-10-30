/** @type {import('next').NextConfig} */
const nextConfig = {
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
