"use client";

import Image from "next/image";
import { useState } from "react";
import { selfServiceRunSchema, type SelfServiceRun } from "@/domain/self-service-run";

type RunState = "idle" | "confirming" | "running" | "complete" | "error";

export function RunConsole() {
  const [state, setState] = useState<RunState>("idle");
  const [run, setRun] = useState<SelfServiceRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setState("running");
    setError(null);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: "1", journeyId: "demo-purchase-persistence", confirmed: true }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body && "error" in body && typeof body.error === "string"
          ? body.error
          : "The journey could not be started.";
        throw new Error(message);
      }
      setRun(selfServiceRunSchema.parse(body));
      setState("complete");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "The journey could not be completed.");
      setState("error");
    }
  };

  return (
    <div className="consoleShell">
      <section className="journeyConsole" aria-labelledby="journey-title">
        <div className="consoleTopline"><span>Approved demo journey</span><span>Solari cloud browser</span></div>
        <div className="consoleHeading">
          <div>
            <p className="eyebrow">Self-service runner</p>
            <h1 id="journey-title">Purchase persistence</h1>
            <p>Sign in, add one product, refresh the cart, and verify that the selected product remains.</p>
          </div>
          <span className="environmentBadge">Synthetic environment</span>
        </div>

        <dl className="journeyContract">
          <div><dt>Target</dt><dd>saucedemo.com</dd></div>
          <div><dt>Actions</dt><dd>Login · add product · refresh</dd></div>
          <div><dt>Expected</dt><dd>Sauce Labs Backpack persists</dd></div>
          <div><dt>Recording</dt><dd>Off</dd></div>
        </dl>

        <div className="consoleAction">
          <div><strong>Ready to run</strong><span>A live run normally completes in 10–30 seconds and consumes Solari usage.</span></div>
          <button disabled={state === "running"} onClick={() => setState("confirming")} type="button">
            {state === "running" ? "Running…" : "Run journey"}
          </button>
        </div>
      </section>

      {state === "confirming" && (
        <div className="dialogBackdrop" role="presentation">
          <section aria-describedby="run-confirmation-copy" aria-labelledby="run-confirmation-title" aria-modal="true" className="confirmDialog" role="dialog">
            <p className="eyebrow">Confirm live execution</p>
            <h2 id="run-confirmation-title">Run this approved journey?</h2>
            <p id="run-confirmation-copy">FlowProof will start a Solari cloud browser, sign in with a public synthetic account, and add one product to its cart. No purchase is made.</p>
            <div className="dialogActions">
              <button className="secondaryButton" onClick={() => setState("idle")} type="button">Cancel</button>
              <button onClick={execute} type="button">Confirm and run</button>
            </div>
          </section>
        </div>
      )}

      {state === "running" && <section aria-live="polite" className="runFeedback"><span className="runSpinner" aria-hidden="true" /><div><strong>Solari is performing the journey</strong><p>Keep this page open while the first synchronous runner completes.</p></div></section>}
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
          {run.screenshotDataUrl && <figure className="evidenceFigure"><Image alt="Final state captured by the fresh Solari run" height={720} src={run.screenshotDataUrl} unoptimized width={1280} /><figcaption>Raw browser evidence from this run.</figcaption></figure>}
        </section>
      )}
    </div>
  );
}
