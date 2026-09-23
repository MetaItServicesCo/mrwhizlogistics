import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which is what the
  // production Docker image runs.
  output: "standalone",

  // There is a package.json at the repo root as well as in frontend/, so Next
  // has to be told which one is the real project root when tracing files.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
