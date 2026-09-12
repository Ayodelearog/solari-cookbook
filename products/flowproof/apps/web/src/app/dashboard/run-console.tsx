"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { queuedRunSchema, runStatusResponseSchema, type SelfServiceRun } from "@/domain/self-service-run";

type RunState = "idle" | "confirming" | "running" | "complete" | "error";

export type RunnableJourney = {
  id: string;
  name: string;
  description: string;
  target: string;
  actions: string;
  expected: string;
  environment: string;
  kind: "reference" | "customer";
};

const referenceJourney: RunnableJourney = {
  id: "demo-purchase-persistence",
  name: "Purchase persistence",
  description: "Sign in, add one product, refresh the cart, and verify that the selected product remains.",
  target: "saucedemo.com",
  actions: "Login · add product · refresh",
  expected: "Sauce Labs Backpack persists",
  environment: "Synthetic environment",
  kind: "reference",
};

async function waitForRun(runId: string) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const statusResponse = await fetch(`/api/runs/${runId}`, { cache: "no-store" });
    const statusBody: unknown = await statusResponse.json();
    if (!statusResponse.ok) throw new Error("The run status could not be retrieved.");
    const status = runStatusResponseSchema.parse(statusBody);
    if (status.complete) return status.run;
    await new Promise((resolve) => window.setTimeout(resolve, 1_500));
  }
  throw new Error("The run is still processing. Reload this page to reconnect to its persisted report.");
}

export function RunConsole({ journey = referenceJourney }: { journey?: RunnableJourney }) {
  const activeRunStorageKey = `flowproof.activeRunId.${journey.id}`;
  const [state, setState] = useState<RunState>("idle");
  const [run, setRun] = useState<SelfServiceRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const activeRunId = window.localStorage.getItem(activeRunStorageKey);
    if (!activeRunId) return;
    void Promise.resolve().then(() => setState("running"));
    void waitForRun(activeRunId).then((persistedRun) => {
      window.localStorage.removeItem(activeRunStorageKey);
      setRun(persistedRun);
      setState("complete");
    }).catch((statusError: unknown) => {
      window.localStorage.removeItem(activeRunStorageKey);
      setError(statusError instanceof Error ? statusError.message : "The persisted run could not be retrieved.");
      setState("error");
    });
  }, [activeRunStorageKey]);

  useEffect(() => {
    if (state === "confirming") cancelRef.current?.focus();
  }, [state]);

  const execute = async () => {
    setState("running");
    setError(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: "1", journeyId: journey.id, idempotencyKey, confirmed: true }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body && "error" in body && typeof body.error === "string"
          ? body.error
          : "The journey could not be started.";
        throw new Error(message);
      }
      const queued = queuedRunSchema.parse(body);
      window.localStorage.setItem(activeRunStorageKey, queued.runId);
      const completedRun = await waitForRun(queued.runId);
      window.localStorage.removeItem(activeRunStorageKey);
      setRun(completedRun);
      setState("complete");
    } catch (runError) {
      window.localStorage.removeItem(activeRunStorageKey);
      setError(runError instanceof Error ? runError.message : "The journey could not be completed.");
      setState("error");
    }
  };

  return (
    <div className="consoleShell">
      <section className="journeyConsole compactConsole" aria-labelledby={`journey-title-${journey.id}`}>
        <div className="compactConsoleMain">
          <div>
            <div className="compactConsoleMeta"><span className="reviewStatus" data-status="APPROVED">APPROVED</span><span>{journey.environment}</span></div>
            <h2 id={`journey-title-${journey.id}`}>{journey.name}</h2>
            <p>{journey.description}</p>
          </div>
          <button disabled={state === "running"} onClick={() => setState("confirming")} type="button">
            {state === "running" ? "Running…" : "Run journey"}
          </button>
        </div>

        <details className="runDetails">
          <summary>View run details</summary>
          <dl className="journeyContract">
            <div><dt>Target</dt><dd>{journey.target}</dd></div>
            <div><dt>Actions</dt><dd>{journey.actions}</dd></div>
            <div><dt>Expected</dt><dd>{journey.expected}</dd></div>
            <div><dt>Recording</dt><dd>Off</dd></div>
          </dl>
          <p>A live run normally completes in 10–30 seconds and consumes Solari usage.</p>
        </details>
      </section>

      {state === "confirming" && (
        <div className="dialogBackdrop" role="presentation">
          <section aria-describedby="run-confirmation-copy" aria-labelledby="run-confirmation-title" aria-modal="true" className="confirmDialog" onKeyDown={(event) => { if (event.key === "Escape") setState("idle"); }} role="dialog">
            <p className="eyebrow">Confirm live execution</p>
            <h2 id="run-confirmation-title">Run {journey.name}?</h2>
            <p id="run-confirmation-copy">{journey.kind === "reference" ? "FlowProof will start a Solari cloud browser, sign in with a public synthetic account, and add one product to its cart. No purchase is made." : `FlowProof will open ${journey.target} in a Solari cloud browser and verify the approved visible-text assertion. It will not enter credentials, click, submit, or record the session.`}</p>
            <div className="dialogActions">
              <button ref={cancelRef} className="secondaryButton" onClick={() => setState("idle")} type="button">Cancel</button>
              <button onClick={execute} type="button">Confirm and run</button>
            </div>
          </section>
        </div>
      )}

      {state === "running" && <section aria-live="polite" className="runFeedback"><span className="runSpinner" aria-hidden="true" /><div><strong>Solari is performing the journey</strong><p>The durable run continues if this page reloads. Its report and evidence are stored privately.</p></div></section>}
      {state === "error" && <section aria-live="assertive" className="runFeedback runError"><div><strong>Run unavailable</strong><p>{error}</p></div></section>}

      {state === "complete" && run && (
        <section className="freshReport" aria-labelledby="fresh-report-title">
          <div className="reportTopline"><span>Fresh run report</span><span>{new Date(run.completedAt).toLocaleString()}</span></div>
          <div className="freshReportHeading">
            <div><p className="eyebrow">Execution complete</p><h2 id="fresh-report-title">{run.journeyName}</h2></div>
            <span className="status" data-outcome={run.outcome}>{run.outcome}</span>
          </div>
          <div className="freshAssertion">
            <div><span>Expected</span><strong>{run.expected}</strong></div>
            <div><span>Observed</span><strong>{run.observed}</strong></div>
          </div>
          <ol className="timeline" aria-label="Fresh journey steps">
            {run.steps.map((step, index) => (
              <li key={step.id}>
                <div className="stepIndex" aria-hidden="true">{index + 1}</div>
                <div className="stepBody"><div className="stepTitle"><h3>{step.intent}</h3><span>{(step.durationMs / 1000).toFixed(1)}s</span></div><p>{step.observed}</p></div>
                <span className="stepStatus">{step.status === "passed" ? "Passed" : "Failed"}</span>
              </li>
            ))}
          </ol>
          {run.evidenceUrl && <figure className="evidenceFigure"><Image alt="Final state captured by the fresh Solari run" height={720} src={run.evidenceUrl} unoptimized width={1280} /><figcaption>Private browser evidence available only to the run owner.</figcaption></figure>}
        </section>
      )}
    </div>
  );
}
