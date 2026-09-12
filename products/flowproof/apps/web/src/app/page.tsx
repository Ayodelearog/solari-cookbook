import Image from "next/image";
import Link from "next/link";
import { liveRuns } from "@/domain/live-runs";

const formatDuration = (milliseconds: number) =>
  `${(milliseconds / 1000).toFixed(1)}s`;

const formatTimestamp = (timestamp: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(timestamp));

const steps = [
  {
    number: "01",
    title: "Choose the journey",
    copy: "Tell us the customer outcome that matters, such as completing signup or saving a new workspace.",
  },
  {
    number: "02",
    title: "Run it for real",
    copy: "FlowProof performs the approved steps in a cloud browser using safe, synthetic data.",
  },
  {
    number: "03",
    title: "See what happened",
    copy: "You get a clear result, the step that failed, and the browser evidence behind it.",
  },
] as const;

export default function Home() {
  const passRun = liveRuns.find((run) => run.outcome === "PASS");

  if (!passRun) {
    throw new Error("The verified PASS artifact is required.");
  }

  return (
    <main>
      <header className="siteHeader reveal revealDelay1">
        <nav aria-label="Primary navigation" className="nav marketingNav">
          <a className="brand" href="#top" aria-label="FlowProof home">
            <span className="brandMark" aria-hidden="true">F</span>
            FlowProof
          </a>
          <div className="marketingNavLinks">
            <a className="navLink" href="#how-it-works">How it works</a>
            <a className="navLink" href="#proof">Proof</a>
          </div>
          <Link className="navAction" href="/dashboard">
            Open dashboard <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <section className="landingHero" id="top">
        <div className="landingHeroCopy">
          <p className="eyebrow reveal revealDelay2">Critical journey assurance</p>
          <h1 className="reveal revealDelay3">
            Your site is online.
            <span>Can customers actually use it?</span>
          </h1>
          <p className="heroCopy reveal revealDelay4">
            FlowProof checks the customer journeys that make your business work,
            then shows you exactly what passed and what did not.
          </p>
          <div className="heroActions reveal revealDelay5">
            <Link className="primaryAction" href="/dashboard">
              Check a journey <span aria-hidden="true">→</span>
            </Link>
            <a className="secondaryAction" href="#how-it-works">
              How it works
            </a>
          </div>
        </div>

        <aside className="browserProof reveal revealDelay5" aria-label="Latest verified journey">
          <div className="browserBar" aria-hidden="true">
            <span /><span /><span />
            <div>test store</div>
          </div>
          <div className="browserProofBody">
            <div className="proofHeader">
              <div><span className="liveDot" aria-hidden="true" />Latest check</div>
              <span className="status" data-outcome={passRun.outcome}>{passRun.outcome}</span>
            </div>
            <p className="proofLabel">Purchase journey</p>
            <h2>Product stayed in the cart after refresh.</h2>
            <div className="proofLine"><span /><span /><span /><span /></div>
            <dl className="proofMetrics">
              <div><dt>Steps</dt><dd>{passRun.steps.length}</dd></div>
              <div><dt>Duration</dt><dd>{formatDuration(passRun.durationMs)}</dd></div>
              <div><dt>Checked</dt><dd>{formatTimestamp(passRun.startedAt)}</dd></div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="plainProblem" aria-labelledby="problem-title">
        <p className="eyebrow">The gap</p>
        <h2 id="problem-title">
          Uptime tells you the door is open.
          <span>FlowProof checks whether customers can get through it.</span>
        </h2>
      </section>

      <section className="simpleProcess" id="how-it-works" aria-labelledby="process-title">
        <div className="simpleSectionHeading">
          <p className="eyebrow">How it works</p>
          <h2 id="process-title">One important journey. Three clear steps.</h2>
        </div>
        <ol>
          {steps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="proofFeature" id="proof" aria-labelledby="proof-title">
        <div className="proofFeatureCopy">
          <p className="eyebrow">Evidence, not guesswork</p>
          <h2 id="proof-title">Know where the journey stopped.</h2>
          <p>
            A result includes each action, what the browser observed, and a
            screenshot of the final state. PASS means the agreed outcome worked
            during that run. Nothing more, and nothing less.
          </p>
          <Link className="textLink" href="/dashboard">
            View your dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
        <figure className="proofScreenshot">
          <Image
            alt="A test store cart with one product remaining after refresh"
            height={720}
            src={passRun.evidenceImage}
            width={1280}
          />
          <figcaption>
            Final browser state from a live Solari run using a synthetic storefront.
          </figcaption>
        </figure>
      </section>

      <section className="simpleCta" aria-labelledby="cta-title">
        <div>
          <p className="eyebrow">Start small</p>
          <h2 id="cta-title">What is the one journey you cannot afford to break?</h2>
        </div>
        <Link className="primaryAction" href="/dashboard">
          Add that journey <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="marketingFooter">
        <a className="brand" href="#top">
          <span className="brandMark" aria-hidden="true">F</span>
          FlowProof
        </a>
        <p>Built to verify outcomes, not promise perfection.</p>
        <Link href="/dashboard">Dashboard</Link>
      </footer>
    </main>
  );
}
