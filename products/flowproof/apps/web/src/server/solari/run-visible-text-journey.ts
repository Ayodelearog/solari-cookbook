import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PublicVisibleTextSpec } from "@/domain/commercial-journey";
import type { SelfServiceRun } from "@/domain/self-service-run";
import { launchSolariBrowser, type SolariBrowserSession } from "./session";

type FailureType = NonNullable<SelfServiceRun["failureType"]>;

class JourneyError extends Error {
  constructor(message: string, readonly failureType: FailureType) {
    super(message);
    this.name = "JourneyError";
  }
}

export function isApprovedNavigation(value: string, approvedHostname: string) {
  try {
    const destination = new URL(value);
    return destination.protocol === "https:" && destination.hostname.toLowerCase() === approvedHostname.toLowerCase();
  } catch {
    return false;
  }
}

export async function runVisibleTextJourney(input: {
  apiKey: string;
  runId: string;
  journeyId: string;
  journeyName: string;
  specification: PublicVisibleTextSpec;
}): Promise<SelfServiceRun & { screenshotDataUrl?: string }> {
  const { apiKey, runId, journeyId, journeyName, specification } = input;
  const startedAt = new Date();
  const screenshotPath = join(tmpdir(), `flowproof-${runId}.png`);
  const stepStartedAt = performance.now();
  let browser: SolariBrowserSession | undefined;
  let page: Awaited<ReturnType<NonNullable<typeof browser>["newPage"]>> | undefined;
  let observed = "The target page did not reach the declared assertion.";

  try {
    browser = await launchSolariBrowser(apiKey);
    page = await browser.newPage();
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!request.isNavigationRequest()) return route.continue();
      if (!isApprovedNavigation(request.url(), specification.hostname)) {
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });

    try {
      await page.goto(specification.baseUrl, { timeout: specification.timeoutMs, waitUntil: "domcontentloaded" });
    } catch {
      throw new JourneyError("The approved page could not be reached without leaving its domain allowlist.", "POLICY");
    }

    if (!isApprovedNavigation(page.url(), specification.hostname)) {
      throw new JourneyError("The page redirected outside the approved domain.", "POLICY");
    }

    try {
      await page.getByText(specification.expectedVisibleText, { exact: true }).first().waitFor({ timeout: specification.timeoutMs });
    } catch {
      throw new JourneyError(`The exact visible text “${specification.expectedVisibleText}” was not observed.`, "PRODUCT_ASSERTION");
    }

    observed = `The exact visible text “${specification.expectedVisibleText}” was visible.`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const screenshot = await readFile(screenshotPath);
    return {
      schemaVersion: "1",
      runId,
      journeyId,
      journeyName,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      outcome: "PASS",
      summary: "The declared read-only customer outcome was observed.",
      expected: specification.expectedVisibleText,
      observed,
      steps: [{ id: "verify-visible-text", intent: "Open the approved page and verify exact visible text", status: "passed", durationMs: Math.round(performance.now() - stepStartedAt), observed }],
      screenshotDataUrl: `data:image/png;base64,${screenshot.toString("base64")}`,
    };
  } catch (error) {
    const failureType: FailureType = error instanceof JourneyError ? error.failureType : "RUNNER_INFRASTRUCTURE";
    const outcome = failureType === "PRODUCT_ASSERTION" ? "FAIL" : "INCONCLUSIVE";
    observed = error instanceof Error ? error.message : "The run ended without enough evidence.";
    await page?.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    const screenshot = await readFile(screenshotPath).catch(() => undefined);
    return {
      schemaVersion: "1",
      runId,
      journeyId,
      journeyName,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      outcome,
      failureType,
      summary: observed,
      expected: specification.expectedVisibleText,
      observed,
      steps: [{ id: "verify-visible-text", intent: "Open the approved page and verify exact visible text", status: "failed", durationMs: Math.round(performance.now() - stepStartedAt), observed }],
      screenshotDataUrl: screenshot ? `data:image/png;base64,${screenshot.toString("base64")}` : undefined,
    };
  } finally {
    await browser?.close().catch(() => undefined);
    await unlink(screenshotPath).catch(() => undefined);
  }
}
