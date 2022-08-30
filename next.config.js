// keep the env for the env.js file
const { env } = require("./src/server/env");
const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/trpc/*",
        destination: `${process.env.DATAUNLOCKER_HOST}/*`, // Proxy to Backend
      },
    ];
  },
};

module.exports = withPlausibleProxy()({ nextConfig });
