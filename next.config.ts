import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
