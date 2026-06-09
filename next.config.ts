import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/prepare", revision },
    { url: "/game", revision },
    { url: "/offline", revision },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: import.meta.dirname,
};

export default withSerwist(nextConfig);
