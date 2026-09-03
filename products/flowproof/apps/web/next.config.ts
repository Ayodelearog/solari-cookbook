import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { withWorkflow } from "workflow/next";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: {
    "/api/internal/runs/[runId]/execute": ["../../node_modules/playwright-core/**/*"],
  },
  serverExternalPackages: ["playwright-core"],
  turbopack: { root: workspaceRoot },
};

export default withWorkflow(nextConfig);
