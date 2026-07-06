import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      {
        source: "/blog-widgets",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/blog-widgets/:path*",
        destination: "/insights/:path*",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/project-stories",
        permanent: true,
      },
      {
        source: "/portfolio",
        destination: "/project-stories",
        permanent: true,
      },
      {
        source: "/project-stories-mock",
        destination: "/project-stories",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/start-a-project",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
