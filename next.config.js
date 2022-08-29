// keep the env for the env.js file
const { env } = require("./src/server/env");
const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPlausibleProxy()({ nextConfig });
