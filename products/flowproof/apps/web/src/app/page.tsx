import Image from "next/image";
import Link from "next/link";
import { liveRuns } from "@/domain/live-runs";

const formatDuration = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}s`;
const formatTimestamp = (timestamp: string) => new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
}).format(new Date(timestamp));

const processSteps = [
  ["Name the outcome", "Describe the customer journey and the business result that must be true."],
  ["Approve the safety contract", "FlowProof turns the brief into fixed steps, assertions, and allowed effects for review."],
  ["Run the journey", "A real Solari cloud browser performs the approved flow using synthetic data."],
  ["Act on evidence", "Receive a clear result, step timeline, failure classification, and private screenshots."],
] as const;

const valueItems = [
  ["Protect revenue and trust", "Find a broken signup, checkout, booking, or onboarding flow before more customers encounter it."],
  ["Reduce repetitive checking", "Replace manual spot checks with repeatable journeys that evaluate the same declared outcome every time."],
  ["Diagnose faster", "See the exact step, observation, and evidence behind a failure instead of starting with a vague customer complaint."],
] as const;

const useCases = ["Signup and account creation", "Checkout and payment confirmation", "Booking and reservation completion", "Customer onboarding", "Workspace or project creation", "Saved state after refresh"] as const;

export default function Home() {
  const passRun = liveRuns.find((run) => run.outcome === "PASS");
  if (!passRun) throw new Error("The verified PASS artifact is required.");

  return (
    <main>
      <header className="siteHeader reveal revealDelay1">
        <nav aria-label="Primary navigation" className="nav marketingNav">
          <a className="brand" href="#top" aria-label="FlowProof home"><span className="brandMark" aria-hidden="true">F</span>FlowProof</a>
          <div className="marketingNavLinks"><a className="navLink" href="#how-it-works">How it works</a><a className="navLink" href="#value">Value</a><a className="navLink" href="#evidence">Evidence</a></div>
          <Link className="navAction" href="/dashboard">Open dashboard <span aria-hidden="true">→</span></Link>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="heroMessage">
          <p className="eyebrow reveal revealDelay2">Critical journey assurance</p>
          <h1 className="reveal revealDelay3">Catch broken customer journeys before customers do.</h1>
          <p className="heroCopy reveal revealDelay4">FlowProof uses real cloud browsers to verify that signup, checkout, booking, and other critical workflows reach the business outcome you expect.</p>
          <div className="heroActions reveal revealDelay5"><Link className="primaryAction" href="/dashboard">Add your first journey <span aria-hidden="true">→</span></Link><a className="secondaryAction" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a></div>
          <div className="trustStrip reveal revealDelay5" aria-label="FlowProof operating principles"><span>Real cloud browsers</span><span>Deterministic assertions</span><span>Private evidence</span><span>Human-reviewed safety</span></div>
        </div>
        <aside className="heroProof reveal revealDelay5" aria-label="Latest verified run summary">
          <div className="proofHeader"><div><span className="liveDot" aria-hidden="true" />Live browser proof</div><span className="status" data-outcome={passRun.outcome}>{passRun.outcome}</span></div>
          <div className="proofJourney"><span>Purchase path</span><strong>Selected product persisted after refresh.</strong></div>
          <dl className="proofMetrics"><div><dt>Steps</dt><dd>{passRun.steps.length}/{passRun.steps.length}</dd></div><div><dt>Duration</dt><dd>{formatDuration(passRun.durationMs)}</dd></div><div><dt>Runner</dt><dd>Solari</dd></div></dl>
          <div className="proofTrace" aria-hidden="true">{passRun.steps.map((step) => <span key={step.stepId} />)}</div>
          <p>Verified {formatTimestamp(passRun.startedAt)} UTC</p>
        </aside>
      </section>

      <section className="problem" aria-labelledby="difference-title">
        <div><p className="eyebrow">The problem</p><h2 id="difference-title">Uptime is not a working product.</h2></div>
        <div className="problemCopy"><p>A server can return 200 while login, checkout, or account creation is broken. Traditional monitoring proves that a page responds, but not that a customer can complete the task.</p><p>FlowProof performs the journey, checks the declared business result, and records evidence so your team knows what worked, what failed, and where to investigate.</p></div>
      </section>

      <section className="marketingSection" id="how-it-works" aria-labelledby="how-title">
        <div className="marketingSectionIntro"><p className="eyebrow">How it works</p><h2 id="how-title">From business outcome to browser proof.</h2><p>You define what must be true. FlowProof turns it into a controlled, repeatable journey and returns evidence your team can use.</p></div>
        <ol className="processGrid">{processSteps.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </section>

      <section className="valueSection" id="value" aria-labelledby="value-title">
        <div className="marketingSectionIntro"><p className="eyebrow">Business value</p><h2 id="value-title">Turn critical journeys into observable assets.</h2><p>The goal is not more test output. It is earlier warning, clearer ownership, and less time spent reproducing customer-facing failures.</p></div>
        <div className="valueGrid">{valueItems.map(([title, description], index) => <article key={title}><span className="valueIcon" aria-hidden="true">{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="useCaseSection" aria-labelledby="use-case-title">
        <div><p className="eyebrow">Where it fits</p><h2 id="use-case-title">Start with the journeys your business cannot afford to lose.</h2></div>
        <ul>{useCases.map((useCase) => <li key={useCase}><span aria-hidden="true">✓</span>{useCase}</li>)}</ul>
      </section>

      <section className="evidenceSection" id="evidence" aria-labelledby="evidence-title">
        <div className="sectionIntro"><div><p className="eyebrow">Real Solari browser evidence</p><h2 id="evidence-title">Three outcomes. No false certainty.</h2></div><p>These sanitized runs distinguish a confirmed product regression from a condition where the product outcome could not be determined.</p></div>
        <aside className="evidenceNote" aria-label="How to read the evidence"><strong>A screenshot records what the browser saw.</strong><span>The verdict comes from comparing that observation with the declared expectation. PASS and FAIL can therefore show the same browser state.</span></aside>
        <div className="outcomeGrid">{liveRuns.map((run) => (
          <article className="outcomeCard" data-outcome={run.outcome} key={run.id}>
            <div className="cardHeading"><span className="status" data-outcome={run.outcome}>{run.outcome}</span><span>{formatDuration(run.durationMs)}</span></div>
            <h3>{run.scenario === "pass" ? "Journey verified" : run.scenario === "fail" ? "Controlled regression caught" : "Certainty withheld"}</h3><p>{run.summary}</p>
            <div className="assertionPanel"><dl><div><dt>Expected</dt><dd>{run.evidenceContext.expected}</dd></div><div><dt>Observed</dt><dd>{run.evidenceContext.observed}</dd></div></dl><p><strong>Why {run.outcome}</strong>{run.evidenceContext.explanation}</p></div>
            <dl className="classificationList"><div><dt>Classification</dt><dd>{run.failureType ?? "Assertions passed"}</dd></div><div><dt>Completed</dt><dd>{formatTimestamp(run.startedAt)} UTC</dd></div></dl>
            <a className="evidenceLink" href={run.evidenceImage}>Open raw browser screenshot <span aria-hidden="true">↗</span></a>
          </article>
        ))}</div>
      </section>

      <section className="runSection" aria-labelledby="run-title">
        <div className="reportTopline"><span>Run report</span><span>Evidence captured by Solari</span></div>
        <div className="sectionHeading"><div><p className="eyebrow">Verified PASS timeline</p><h2 id="run-title">{passRun.journeyName}</h2></div><span className="status" data-outcome={passRun.outcome}>{passRun.outcome}</span></div>
        <div className="runSummary"><dl><div><dt>Environment</dt><dd>{passRun.environment}</dd></div><div><dt>Duration</dt><dd>{formatDuration(passRun.durationMs)}</dd></div><div><dt>Evidence</dt><dd>{passRun.steps.length} verified steps</dd></div></dl><p>{passRun.summary}</p></div>
        <div className="reportGrid"><ol className="timeline" aria-label="Journey steps">{passRun.steps.map((step, index) => <li key={step.stepId}><div className="stepIndex" aria-hidden="true">{index + 1}</div><div className="stepBody"><div className="stepTitle"><h3>{step.intent}</h3><span>{formatDuration(step.durationMs)}</span></div><p>{step.observed}</p></div><span className="stepStatus">Passed</span></li>)}</ol><figure className="evidenceFigure"><Image alt="SauceDemo cart containing one Sauce Labs Backpack after refresh" height={720} priority src={passRun.evidenceImage} width={1280} /><figcaption>Final state captured by the live Solari cloud browser.</figcaption></figure></div>
        <p className="disclosure">Verified against a public synthetic storefront on 2 September 2026. This evidence proves only the declared journey at the recorded time; it does not claim complete product quality or production readiness.</p>
      </section>

      <section className="todaySection" aria-labelledby="today-title">
        <div><p className="eyebrow">Available now</p><h2 id="today-title">A focused commercial foundation.</h2><p>FlowProof currently supports a managed first journey from brief to reviewed contract, live Solari execution, and private evidence.</p></div>
        <div className="todayGrid"><article><h3>What customers can do</h3><ul><li>Submit a critical journey brief</li><li>Review the approved safety contract</li><li>Run the journey in a real cloud browser</li><li>Inspect the result, timeline, and screenshots</li></ul></article><article><h3>What comes next</h3><ul><li>Self-serve journey configuration</li><li>Schedules and failure alerts</li><li>Team invitations and permissions</li><li>Usage plans and billing</li></ul></article></div>
        <p className="scopeNote">Journeys that require credentials, recording, or payment mutations need a managed setup and an approved synthetic environment.</p>
      </section>

      <section className="faqSection" aria-labelledby="faq-title">
        <div className="marketingSectionIntro"><p className="eyebrow">Clear answers</p><h2 id="faq-title">What FlowProof does and does not claim.</h2></div>
        <div className="faqList"><details><summary>How is this different from uptime monitoring?</summary><p>Uptime monitoring checks whether a service responds. FlowProof completes a customer journey and verifies its declared business outcome.</p></details><details><summary>Does a PASS mean the whole product is defect-free?</summary><p>No. It means the approved assertions for that journey passed in the recorded environment at that time.</p></details><details><summary>Does FlowProof use real customer data?</summary><p>No. Development and demonstrations use synthetic identities and safe test environments. Sensitive data and production payment activity are outside the default workflow.</p></details><details><summary>Does AI decide whether a journey passed?</summary><p>No. The pass condition is fixed in the approved journey contract. AI may help propose steps or classify evidence, but it cannot silently change the business assertion.</p></details></div>
      </section>

      <section className="finalCta" aria-labelledby="cta-title"><p className="eyebrow">Start with one critical journey</p><h2 id="cta-title">Choose the customer outcome that would hurt most if it failed today.</h2><p>Define it once, run it in a real browser, and get evidence your team can act on.</p><Link className="primaryAction" href="/dashboard">Open the FlowProof dashboard <span aria-hidden="true">→</span></Link></section>
      <footer className="marketingFooter"><a className="brand" href="#top"><span className="brandMark" aria-hidden="true">F</span>FlowProof</a><p>Critical journey assurance for customer-facing products.</p><Link href="/dashboard">Dashboard</Link></footer>
    </main>
  );
}
