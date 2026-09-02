/** FlowProof reference journey: verify a business outcome, not only uptime. */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Solari } from "@solarisdk/browser"

type Scenario = "pass" | "fail" | "inconclusive"
type Outcome = "PASS" | "FAIL" | "INCONCLUSIVE"
type FailureType = "PRODUCT_ASSERTION" | "THIRD_PARTY" | "RUNNER_INFRASTRUCTURE" | "UNKNOWN"
type StepResult = {
  id: string
  intent: string
  status: "passed" | "failed"
  durationMs: number
  observed: string
}
type RunResult = {
  schemaVersion: "1"
  scenario: Scenario
  journey: string
  targetUrl: string
  sessionId?: string
  startedAt: string
  completedAt: string
  outcome: Outcome
  failureType?: FailureType
  summary: string
  steps: StepResult[]
}

class JourneyError extends Error {
  constructor(message: string, readonly failureType: FailureType) {
    super(message)
    this.name = "JourneyError"
  }
}

const parseScenario = (value: string | undefined): Scenario => {
  if (!value || value === "pass") return "pass"
  if (value === "fail" || value === "inconclusive") return value
  throw new Error("FLOWPROOF_SCENARIO must be pass, fail, or inconclusive")
}

const apiKey = process.env.SOLARI_API_KEY
if (!apiKey) throw new Error("SOLARI_API_KEY is required. Get one at https://console.getsolari.com")

const scenario = parseScenario(process.env.FLOWPROOF_SCENARIO)
const defaultTarget = scenario === "inconclusive"
  ? "https://unavailable.flowproof.invalid/"
  : "https://www.saucedemo.com/"
const targetUrl = process.env.TARGET_URL ?? defaultTarget
const recording = process.env.SOLARI_RECORDING === "true"
const artifactDir = join(process.cwd(), "artifacts", scenario)
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
      observed: error instanceof Error ? error.message : "Unknown journey failure",
    })
    throw error
  }
}

type Browser = Awaited<ReturnType<typeof solari.launch>>
type Page = Awaited<ReturnType<Browser["newPage"]>>

let result: RunResult
let browser: Browser | undefined
let page: Page | undefined

try {
  await mkdir(artifactDir, { recursive: true })
  browser = await solari.launch({ recording })
  page = await browser.newPage()

  await runStep("open", "Open the storefront", async () => {
    try {
      await page?.goto(targetUrl)
    } catch {
      throw new JourneyError(
        "The synthetic target could not be reached, so the product outcome is unknown.",
        "THIRD_PARTY",
      )
    }
    await page?.getByRole("button", { name: "Login" }).waitFor()
    return "The login action is visible."
  })

  await runStep("authenticate", "Sign in with a synthetic customer", async () => {
    await page?.getByPlaceholder("Username").fill("standard_user")
    await page?.getByPlaceholder("Password").fill("secret_sauce")
    await page?.getByRole("button", { name: "Login" }).click()
    await page?.getByText("Products", { exact: true }).waitFor()
    return "The product inventory is visible after authentication."
  })

  await runStep("add-product", "Add the expected product to the cart", async () => {
    await page?.getByRole("button", { name: "Add to cart" }).first().click()
    await page?.locator(".shopping_cart_badge").waitFor()
    const count = await page?.locator(".shopping_cart_badge").innerText()
    if (count !== "1") {
      throw new JourneyError(`Expected cart count 1, observed ${count ?? "nothing"}.`, "PRODUCT_ASSERTION")
    }
    return "The cart badge reports one product."
  })

  await runStep("verify-cart", "Verify the selected product persists", async () => {
    await page?.locator(".shopping_cart_link").click()
    await page?.reload()
    const observedProduct = await page?.locator(".inventory_item_name").innerText()
    const expectedProduct = scenario === "fail" ? "Sauce Labs Fleece Jacket" : "Sauce Labs Backpack"
    if (observedProduct !== expectedProduct) {
      throw new JourneyError(
        `Expected ${expectedProduct} after refresh, observed ${observedProduct ?? "nothing"}.`,
        "PRODUCT_ASSERTION",
      )
    }
    return `${expectedProduct} remains visible after cart refresh.`
  })

  await page.screenshot({ path: join(artifactDir, "final-state.png"), fullPage: true })
  result = {
    schemaVersion: "1",
    scenario,
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
  const failureType = error instanceof JourneyError ? error.failureType : "RUNNER_INFRASTRUCTURE"
  const outcome: Outcome = failureType === "PRODUCT_ASSERTION" ? "FAIL" : "INCONCLUSIVE"
  await page?.screenshot({ path: join(artifactDir, "final-state.png"), fullPage: true }).catch(() => undefined)
  result = {
    schemaVersion: "1",
    scenario,
    journey: "Purchase path reaches a cart with the selected product",
    targetUrl,
    sessionId: browser?.id,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    outcome,
    failureType,
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
