/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.acuityscheduling.com",
      },
      {
        protocol: "https",
        hostname: "**.squarespace-cdn.com",
      },
    ],
  },
}

export default nextConfig
