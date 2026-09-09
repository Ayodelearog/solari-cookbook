"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ReviewJourney = {
  id: string;
  name: string;
  businessPurpose: string;
  expectedOutcome: string;
  currentVersion: number;
  environmentName: string;
  baseUrl: string;
  hostname: string;
  syntheticDataConfirmed: boolean;
  createdAt: string;
};

type PendingDecision = { journey: ReviewJourney; decision: "APPROVED" | "REJECTED" };

export function ReviewQueue({ journeys }: { journeys: ReviewJourney[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expectedText, setExpectedText] = useState<Record<string, string>>({});
  const [timeouts, setTimeouts] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openDecision = (journey: ReviewJourney, decision: PendingDecision["decision"]) => {
    setPending({ journey, decision });
    window.setTimeout(() => cancelRef.current?.focus(), 0);
  };

  const saveDecision = async () => {
    if (!pending) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/operator/journeys/${pending.journey.id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: "1",
          decision: pending.decision,
          notes: notes[pending.journey.id] ?? "",
          expectedVisibleText: pending.decision === "APPROVED" ? expectedText[pending.journey.id] : undefined,
          timeoutMs: pending.decision === "APPROVED" ? (timeouts[pending.journey.id] ?? 30_000) : undefined,
          confirmed: true,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const error = typeof body === "object" && body && "error" in body && typeof body.error === "string" ? body.error : "The decision could not be saved.";
        throw new Error(error);
      }
      setPending(null);
      setMessage(`${pending.journey.name} was ${pending.decision.toLowerCase()}.`);
      router.refresh();
    } catch (error) {
      setPending(null);
      setMessage(error instanceof Error ? error.message : "The decision could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  if (journeys.length === 0) return <p className="emptyHint">There are no journey briefs waiting for review.</p>;

  return (
    <div className="reviewQueue">
      {message ? <p aria-live="polite" className="formMessage">{message}</p> : null}
      {journeys.map((journey) => (
        <article className="reviewCard" key={journey.id}>
          <div className="reviewCardTopline"><span className="reviewStatus">IN REVIEW</span><span>Version {journey.currentVersion} · {new Date(journey.createdAt).toLocaleDateString()}</span></div>
          <h2>{journey.name}</h2>
          <p><strong>{journey.environmentName}</strong> · {journey.hostname}</p>
          <dl className="reviewContract">
            <div><dt>Business purpose</dt><dd>{journey.businessPurpose}</dd></div>
            <div><dt>Successful outcome</dt><dd>{journey.expectedOutcome}</dd></div>
            <div><dt>Target</dt><dd><a href={journey.baseUrl} rel="noreferrer" target="_blank">{journey.baseUrl}</a></dd></div>
            <div><dt>Data policy</dt><dd>{journey.syntheticDataConfirmed ? "Synthetic-only confirmed" : "Not confirmed"}</dd></div>
          </dl>
          <label>Review notes<textarea minLength={10} maxLength={1000} onChange={(event) => setNotes((current) => ({ ...current, [journey.id]: event.target.value }))} placeholder="Record domain, effects, test data, assertion, and cleanup findings." rows={4} value={notes[journey.id] ?? ""} /></label>
          <div className="supportedContract">
            <div><span className="reviewStatus">SUPPORTED CONTRACT</span><strong>Public page contains exact visible text</strong></div>
            <p>Read-only: one HTTPS navigation, no credentials, no clicks, no recording, one attempt.</p>
          </div>
          <label>Exact visible text to verify<input maxLength={200} minLength={3} onChange={(event) => setExpectedText((current) => ({ ...current, [journey.id]: event.target.value }))} placeholder="Workspace created successfully" value={expectedText[journey.id] ?? ""} /></label>
          <label>Run timeout<select onChange={(event) => setTimeouts((current) => ({ ...current, [journey.id]: Number(event.target.value) }))} value={timeouts[journey.id] ?? 30000}><option value={15000}>15 seconds</option><option value={30000}>30 seconds</option><option value={60000}>60 seconds</option></select></label>
          <div className="reviewActions">
            <button className="secondaryButton" disabled={(notes[journey.id]?.trim().length ?? 0) < 10} onClick={() => openDecision(journey, "REJECTED")} type="button">Reject</button>
            <button disabled={(notes[journey.id]?.trim().length ?? 0) < 10 || (expectedText[journey.id]?.trim().length ?? 0) < 3} onClick={() => openDecision(journey, "APPROVED")} type="button">Approve runnable journey</button>
          </div>
        </article>
      ))}
      {pending ? (
        <div className="dialogBackdrop" role="presentation">
          <section aria-modal="true" className="confirmDialog" onKeyDown={(event) => { if (event.key === "Escape" && !submitting) setPending(null); }} role="dialog" aria-labelledby="review-confirmation-title">
            <p className="eyebrow">Confirm review decision</p>
            <h2 id="review-confirmation-title">{pending.decision === "APPROVED" ? "Approve" : "Reject"} {pending.journey.name}?</h2>
            <p>This records an immutable decision for version {pending.journey.currentVersion}. {pending.decision === "APPROVED" ? `It creates one read-only executable contract that checks for “${expectedText[pending.journey.id]}”.` : "It returns the brief without creating an executable contract."}</p>
            <div className="dialogActions"><button ref={cancelRef} className="secondaryButton" disabled={submitting} onClick={() => setPending(null)} type="button">Cancel</button><button disabled={submitting} onClick={saveDecision} type="button">{submitting ? "Saving…" : "Confirm decision"}</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
