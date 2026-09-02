import { demoRun } from "@/domain/demo-run";

const formatDuration = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}s`;

export default function Home() {
  return (
    <main>
      <nav aria-label="Primary navigation" className="nav">
        <a className="brand" href="#top" aria-label="FlowProof home">FlowProof</a>
        <a className="navLink" href="#run">View demo run</a>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">Critical journey assurance</p>
        <h1>Know your customer can finish the journey—not just open the page.</h1>
        <p className="heroCopy">
          FlowProof uses real cloud browsers to verify signup, checkout, booking,
          and the workflows your business cannot afford to break.
        </p>
        <a className="primaryAction" href="#run">Inspect a complete run</a>
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

      <section className="runSection" id="run" aria-labelledby="run-title">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Reference run</p>
            <h2 id="run-title">{demoRun.journeyName}</h2>
          </div>
          <span className="status">{demoRun.outcome}</span>
        </div>

        <div className="runSummary">
          <dl>
            <div><dt>Environment</dt><dd>{demoRun.environment}</dd></div>
            <div><dt>Duration</dt><dd>{formatDuration(demoRun.durationMs)}</dd></div>
            <div><dt>Evidence</dt><dd>{demoRun.steps.length} verified steps</dd></div>
          </dl>
          <p>{demoRun.summary}</p>
        </div>

        <ol className="timeline" aria-label="Journey steps">
          {demoRun.steps.map((step, index) => (
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

        <p className="disclosure">
          This run uses deterministic fixture data while the live Solari runner is
          being integrated. It demonstrates the report contract, not a completed
          production monitor.
        </p>
      </section>
    </main>
  );
}
