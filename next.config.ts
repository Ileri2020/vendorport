import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  turbopack: {
    root: "./",
  },

  // async redirects() {
  //   return [
  //     {
  //       source: '/:path*',
  //       has: [
  //         {
  //           type: 'host',
  //           value: '.*\\.vercel\\.app',
  //         },
  //       ],
  //       destination: 'https://www.succo.vercel.app/:path*',
  //       permanent: true,
  //     },
  //   ]
  // },
};

export default nextConfig;
