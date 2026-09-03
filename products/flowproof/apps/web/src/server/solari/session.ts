import { createRequire } from "node:module";
import { join } from "node:path";
import type { Browser } from "patchright-core";

const solariApiUrl = "https://api.getsolari.com";

type SessionResponse = {
  sessionId?: string;
  wsEndpoint?: string;
};

export type SolariBrowserSession = {
  newPage: Browser["newPage"];
  close: () => Promise<void>;
};

export async function launchSolariBrowser(apiKey: string): Promise<SolariBrowserSession> {
  const runtimeRequire = createRequire(import.meta.url);
  const patchrightSpecifier = process.env.VERCEL === "1"
    ? join(process.cwd(), "node_modules/patchright-core/index.js")
    : "patchright-core";
  const { chromium } = runtimeRequire(patchrightSpecifier) as typeof import("patchright-core");
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const response = await fetch(`${solariApiUrl}/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Solari session creation failed with status ${response.status}.`);

  const session = await response.json() as SessionResponse;
  if (!session.sessionId || !session.wsEndpoint) throw new Error("Solari returned an invalid session response.");

  let browser: Browser;
  try {
    browser = await chromium.connect(session.wsEndpoint);
  } catch (error) {
    await releaseSession(session.sessionId, headers);
    throw error;
  }

  let closed = false;
  return {
    newPage: browser.newPage.bind(browser),
    close: async () => {
      if (closed) return;
      closed = true;
      let browserError: unknown;
      try {
        await browser.close();
      } catch (error) {
        browserError = error;
      }
      await releaseSession(session.sessionId!, headers);
      if (browserError) throw browserError;
    },
  };
}

async function releaseSession(sessionId: string, headers: Record<string, string>) {
  const response = await fetch(`${solariApiUrl}/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    headers,
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (response && !response.ok && response.status !== 404) {
    console.warn("FlowProof could not confirm Solari session release", { status: response.status });
  }
}
