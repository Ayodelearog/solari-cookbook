import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { withWorkflow } from "workflow/next";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/patchright-core/**/*",
      "../../node_modules/fsevents/**/*",
    ],
  },
  serverExternalPackages: ["patchright-core", "fsevents"],
  turbopack: { root: workspaceRoot },
};

export default withWorkflow(nextConfig);
