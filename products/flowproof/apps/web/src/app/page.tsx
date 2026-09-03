import Image from "next/image";
import Link from "next/link";
import { liveRuns } from "@/domain/live-runs";

const formatDuration = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}s`;
const formatTimestamp = (timestamp: string) => new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
}).format(new Date(timestamp));

export default function Home() {
  const passRun = liveRuns.find((run) => run.outcome === "PASS");
  if (!passRun) throw new Error("The verified PASS artifact is required.");

  return (
    <main>
      <header className="siteHeader reveal revealDelay1">
        <nav aria-label="Primary navigation" className="nav">
          <a className="brand" href="#top" aria-label="FlowProof home">
            <span className="brandMark" aria-hidden="true">F</span>
            FlowProof
          </a>
          <a className="navLink" href="#evidence">
            Live evidence
            <span aria-hidden="true">↘</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="heroMessage">
          <p className="eyebrow reveal revealDelay2">Critical journey assurance</p>
          <h1 className="reveal revealDelay3">Know the journey works before your customers tell you it doesn’t.</h1>
          <p className="heroCopy reveal revealDelay4">
            FlowProof uses real cloud browsers to verify signup, checkout, booking,
            and the workflows your business cannot afford to break.
          </p>
          <div className="heroActions reveal revealDelay5">
            <Link className="primaryAction" href="/dashboard">Run a live journey <span aria-hidden="true">→</span></Link>
            <a className="secondaryAction" href="#evidence">Inspect verified runs <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <aside className="heroProof reveal revealDelay5" aria-label="Latest verified run summary">
          <div className="proofHeader">
            <div>
              <span className="liveDot" aria-hidden="true" />
              Live browser proof
            </div>
            <span className="status" data-outcome={passRun.outcome}>{passRun.outcome}</span>
          </div>
          <div className="proofJourney">
            <span>Purchase path</span>
            <strong>Selected product persisted after refresh.</strong>
          </div>
          <dl className="proofMetrics">
            <div><dt>Steps</dt><dd>{passRun.steps.length}/{passRun.steps.length}</dd></div>
            <div><dt>Duration</dt><dd>{formatDuration(passRun.durationMs)}</dd></div>
            <div><dt>Runner</dt><dd>Solari</dd></div>
          </dl>
          <div className="proofTrace" aria-hidden="true">
            {passRun.steps.map((step) => <span key={step.stepId} />)}
          </div>
          <p>Verified {formatTimestamp(passRun.startedAt)} UTC</p>
        </aside>
      </section>

      <section className="problem" aria-labelledby="difference-title">
        <div>
          <p className="eyebrow">The difference</p>
          <h2 id="difference-title">Uptime is not a working product.</h2>
        </div>
        <p>
          A server can return 200 while login, checkout, or account creation is
          broken. FlowProof performs the customer journey, checks the business
          outcome, and records evidence at every step.
        </p>
      </section>

      <section className="evidenceSection" id="evidence" aria-labelledby="evidence-title">
        <div className="sectionIntro">
          <div>
            <p className="eyebrow">Real Solari browser evidence</p>
            <h2 id="evidence-title">Three outcomes. No false certainty.</h2>
          </div>
          <p>
            These sanitized runs distinguish a confirmed product regression from
            a condition where the product outcome could not be determined.
          </p>
        </div>

        <aside className="evidenceNote" aria-label="How to read the evidence">
          <strong>A screenshot records what the browser saw.</strong>
          <span>
            The verdict comes from comparing that observation with the declared
            expectation. PASS and FAIL can therefore show the same browser state.
          </span>
        </aside>

        <div className="outcomeGrid">
          {liveRuns.map((run) => (
            <article className="outcomeCard" data-outcome={run.outcome} key={run.id}>
              <div className="cardHeading">
                <span className="status" data-outcome={run.outcome}>{run.outcome}</span>
                <span>{formatDuration(run.durationMs)}</span>
              </div>
              <h3>{run.scenario === "pass" ? "Journey verified" : run.scenario === "fail" ? "Controlled regression caught" : "Certainty withheld"}</h3>
              <p>{run.summary}</p>
              <div className="assertionPanel">
                <dl>
                  <div><dt>Expected</dt><dd>{run.evidenceContext.expected}</dd></div>
                  <div><dt>Observed</dt><dd>{run.evidenceContext.observed}</dd></div>
                </dl>
                <p><strong>Why {run.outcome}</strong>{run.evidenceContext.explanation}</p>
              </div>
              <dl className="classificationList">
                <div><dt>Classification</dt><dd>{run.failureType ?? "Assertions passed"}</dd></div>
                <div><dt>Completed</dt><dd>{formatTimestamp(run.startedAt)} UTC</dd></div>
              </dl>
              <a className="evidenceLink" href={run.evidenceImage}>
                Open raw browser screenshot <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="runSection" aria-labelledby="run-title">
        <div className="reportTopline">
          <span>Run report</span>
          <span>Evidence captured by Solari</span>
        </div>
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Verified PASS timeline</p>
            <h2 id="run-title">{passRun.journeyName}</h2>
          </div>
          <span className="status" data-outcome={passRun.outcome}>{passRun.outcome}</span>
        </div>

        <div className="runSummary">
          <dl>
            <div><dt>Environment</dt><dd>{passRun.environment}</dd></div>
            <div><dt>Duration</dt><dd>{formatDuration(passRun.durationMs)}</dd></div>
            <div><dt>Evidence</dt><dd>{passRun.steps.length} verified steps</dd></div>
          </dl>
          <p>{passRun.summary}</p>
        </div>

        <div className="reportGrid">
          <ol className="timeline" aria-label="Journey steps">
            {passRun.steps.map((step, index) => (
              <li key={step.stepId}>
                <div className="stepIndex" aria-hidden="true">{index + 1}</div>
                <div className="stepBody">
                  <div className="stepTitle">
                    <h3>{step.intent}</h3>
                    <span>{formatDuration(step.durationMs)}</span>
                  </div>
                  <p>{step.observed}</p>
                </div>
                <span className="stepStatus">Passed</span>
              </li>
            ))}
          </ol>

          <figure className="evidenceFigure">
            <Image
              alt="SauceDemo cart containing one Sauce Labs Backpack after refresh"
              height={720}
              priority
              src={passRun.evidenceImage}
              width={1280}
            />
            <figcaption>Final state captured by the live Solari cloud browser.</figcaption>
          </figure>
        </div>

        <p className="disclosure">
          Verified against a public synthetic storefront on 2 September 2026.
          This evidence proves only the declared journey at the recorded time; it
          does not claim complete product quality or production readiness.
        </p>
      </section>
    </main>
  );
}
