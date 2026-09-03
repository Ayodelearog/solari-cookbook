import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import type { SelfServiceRun } from "@/domain/self-service-run";

type FailureType = NonNullable<SelfServiceRun["failureType"]>;
type Step = SelfServiceRun["steps"][number];

class JourneyError extends Error {
  constructor(message: string, readonly failureType: FailureType) {
    super(message);
    this.name = "JourneyError";
  }
}

const journeyId = "demo-purchase-persistence" as const;
const journeyName = "Purchase path keeps the selected product after refresh";
const expected = "Sauce Labs Backpack remains in the cart after refresh.";
const targetUrl = "https://www.saucedemo.com/";

export async function runDemoJourney(apiKey: string, requestedRunId?: string): Promise<SelfServiceRun & { screenshotDataUrl?: string }> {
  // Keep the ESM-only SDK external to Turbopack and the Workflow compiler.
  // A normal dynamic import is rewritten into a context loader that fails in a
  // Vercel step with "module expression is too dynamic".
  const importExternal = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<typeof import("@solarisdk/browser")>;
  const sdkSpecifier = process.env.LAMBDA_TASK_ROOT
    ? pathToFileURL(join(process.env.LAMBDA_TASK_ROOT, "node_modules/@solarisdk/browser/dist/index.js")).href
    : "@solarisdk/browser";
  const { Solari } = await importExternal(sdkSpecifier);
  const runId = requestedRunId ?? randomUUID();
  const startedAt = new Date();
  const steps: Step[] = [];
  const screenshotPath = join(tmpdir(), `flowproof-${runId}.png`);
  const solari = new Solari({ apiKey, timeoutMs: 30_000 });
  let browser: Awaited<ReturnType<typeof solari.launch>> | undefined;
  let page: Awaited<ReturnType<NonNullable<typeof browser>["newPage"]>> | undefined;
  let observed = "The journey did not reach its final assertion.";

  const runStep = async (id: string, intent: string, action: () => Promise<string>) => {
    const started = performance.now();
    try {
      const stepObservation = await action();
      steps.push({ id, intent, status: "passed", durationMs: Math.round(performance.now() - started), observed: stepObservation });
      return stepObservation;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown journey failure";
      steps.push({ id, intent, status: "failed", durationMs: Math.round(performance.now() - started), observed: message });
      throw error;
    }
  };

  try {
    browser = await solari.launch({ recording: false, retries: 1, probe: true });
    page = await browser.newPage();

    await runStep("open", "Open the storefront", async () => {
      try {
        await page?.goto(targetUrl);
      } catch {
        throw new JourneyError("The storefront could not be reached, so its product outcome is unknown.", "THIRD_PARTY");
      }
      await page?.getByRole("button", { name: "Login" }).waitFor();
      return "The login action is visible.";
    });

    await runStep("authenticate", "Sign in with the synthetic customer", async () => {
      await page?.getByPlaceholder("Username").fill("standard_user");
      await page?.getByPlaceholder("Password").fill("secret_sauce");
      await page?.getByRole("button", { name: "Login" }).click();
      await page?.getByText("Products", { exact: true }).waitFor();
      return "The product inventory is visible after authentication.";
    });

    await runStep("add-product", "Add the expected product to the cart", async () => {
      await page?.getByRole("button", { name: "Add to cart" }).first().click();
      await page?.locator(".shopping_cart_badge").waitFor();
      const count = await page?.locator(".shopping_cart_badge").innerText();
      if (count !== "1") throw new JourneyError(`Expected cart count 1, observed ${count ?? "nothing"}.`, "PRODUCT_ASSERTION");
      return "The cart badge reports one product.";
    });

    observed = await runStep("verify-cart", "Verify the selected product persists", async () => {
      await page?.locator(".shopping_cart_link").click();
      await page?.reload();
      const product = await page?.locator(".inventory_item_name").innerText();
      if (product !== "Sauce Labs Backpack") {
        throw new JourneyError(`Expected Sauce Labs Backpack after refresh, observed ${product ?? "nothing"}.`, "PRODUCT_ASSERTION");
      }
      return "Sauce Labs Backpack remained visible after refresh.";
    });

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
      summary: "All declared customer outcomes were observed.",
      expected,
      observed,
      steps,
      screenshotDataUrl: `data:image/png;base64,${screenshot.toString("base64")}`,
    };
  } catch (error) {
    const failureType: FailureType = error instanceof JourneyError ? error.failureType : "RUNNER_INFRASTRUCTURE";
    const outcome = failureType === "PRODUCT_ASSERTION" ? "FAIL" : "INCONCLUSIVE";
    const message = error instanceof Error ? error.message : "The run ended without enough evidence.";
    observed = message;
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
      summary: message,
      expected,
      observed,
      steps: steps.length > 0 ? steps : [{ id: "launch", intent: "Launch the cloud browser", status: "failed", durationMs: 0, observed: message }],
      screenshotDataUrl: screenshot ? `data:image/png;base64,${screenshot.toString("base64")}` : undefined,
    };
  } finally {
    await browser?.close().catch(() => undefined);
    await solari.close().catch(() => undefined);
    await unlink(screenshotPath).catch(() => undefined);
  }
}
