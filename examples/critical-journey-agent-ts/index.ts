/** FlowProof reference journey: verify a business outcome, not only uptime. */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Solari } from "@solarisdk/browser"

type Outcome = "PASS" | "FAIL" | "INCONCLUSIVE"
type StepResult = {
  id: string
  intent: string
  status: "passed" | "failed"
  durationMs: number
  observed: string
}
type RunResult = {
  schemaVersion: "1"
  journey: string
  targetUrl: string
  sessionId?: string
  startedAt: string
  completedAt: string
  outcome: Outcome
  failureType?: "PRODUCT_ASSERTION" | "RUNNER_INFRASTRUCTURE"
  summary: string
  steps: StepResult[]
}

const apiKey = process.env.SOLARI_API_KEY
if (!apiKey) throw new Error("SOLARI_API_KEY is required. Get one at https://console.getsolari.com")

const targetUrl = process.env.TARGET_URL ?? "https://www.saucedemo.com/"
const recording = process.env.SOLARI_RECORDING === "true"
const artifactDir = join(process.cwd(), "artifacts")
const startedAt = new Date()
const steps: StepResult[] = []
const solari = new Solari({ apiKey })

const runStep = async (id: string, intent: string, action: () => Promise<string>) => {
  const start = performance.now()
  try {
    const observed = await action()
    steps.push({ id, intent, status: "passed", durationMs: Math.round(performance.now() - start), observed })
  } catch (error) {
    steps.push({
      id,
      intent,
      status: "failed",
      durationMs: Math.round(performance.now() - start),
      observed: error instanceof Error ? error.message : "Unknown assertion failure",
    })
    throw error
  }
}

let result: RunResult
let browser: Awaited<ReturnType<typeof solari.launch>> | undefined

try {
  await mkdir(artifactDir, { recursive: true })
  browser = await solari.launch({ recording })
  const page = await browser.newPage()

  await runStep("open", "Open the storefront", async () => {
    await page.goto(targetUrl)
    await page.getByRole("button", { name: "Login" }).waitFor()
    return "The login action is visible."
  })

  await runStep("authenticate", "Sign in with a synthetic customer", async () => {
    await page.getByPlaceholder("Username").fill("standard_user")
    await page.getByPlaceholder("Password").fill("secret_sauce")
    await page.getByRole("button", { name: "Login" }).click()
    await page.getByText("Products", { exact: true }).waitFor()
    return "The product inventory is visible after authentication."
  })

  await runStep("add-product", "Add the expected product to the cart", async () => {
    await page.getByRole("button", { name: "Add to cart" }).first().click()
    await page.locator(".shopping_cart_badge").waitFor()
    const count = await page.locator(".shopping_cart_badge").innerText()
    if (count !== "1") throw new Error(`Expected cart count 1, observed ${count}`)
    return "The cart badge reports one product."
  })

  await runStep("verify-cart", "Verify the selected product persists", async () => {
    await page.locator(".shopping_cart_link").click()
    await page.getByText("Sauce Labs Backpack", { exact: true }).waitFor()
    await page.reload()
    await page.getByText("Sauce Labs Backpack", { exact: true }).waitFor()
    return "Sauce Labs Backpack remains visible after cart refresh."
  })

  await page.screenshot({ path: join(artifactDir, "final-state.png"), fullPage: true })
  result = {
    schemaVersion: "1",
    journey: "Purchase path reaches a cart with the selected product",
    targetUrl,
    sessionId: browser.id,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    outcome: "PASS",
    summary: "All declared customer outcomes were observed.",
    steps,
  }
} catch (error) {
  const productFailure = steps.some((step) => step.status === "failed")
  result = {
    schemaVersion: "1",
    journey: "Purchase path reaches a cart with the selected product",
    targetUrl,
    sessionId: browser?.id,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    outcome: productFailure ? "FAIL" : "INCONCLUSIVE",
    failureType: productFailure ? "PRODUCT_ASSERTION" : "RUNNER_INFRASTRUCTURE",
    summary: error instanceof Error ? error.message : "The run ended without enough evidence.",
    steps,
  }
} finally {
  await browser?.close()
  await solari.close()
}

await writeFile(join(artifactDir, "run.json"), `${JSON.stringify(result, null, 2)}\n`)
console.log(`${result.outcome} — ${result.journey}`)
console.log(`Evidence: ${artifactDir}`)
if (result.outcome !== "PASS") process.exitCode = 1
