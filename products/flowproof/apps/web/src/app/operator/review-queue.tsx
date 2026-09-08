"use client";

import { useState } from "react";
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
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saveDecision = async () => {
    if (!pending) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/operator/journeys/${pending.journey.id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: "1", decision: pending.decision, notes: notes[pending.journey.id] ?? "", confirmed: true }),
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
          <div className="reviewActions">
            <button className="secondaryButton" disabled={(notes[journey.id]?.trim().length ?? 0) < 10} onClick={() => setPending({ journey, decision: "REJECTED" })} type="button">Reject</button>
            <button disabled={(notes[journey.id]?.trim().length ?? 0) < 10} onClick={() => setPending({ journey, decision: "APPROVED" })} type="button">Approve journey</button>
          </div>
        </article>
      ))}
      {pending ? (
        <div className="dialogBackdrop" role="presentation">
          <section aria-modal="true" className="confirmDialog" role="dialog" aria-labelledby="review-confirmation-title">
            <p className="eyebrow">Confirm review decision</p>
            <h2 id="review-confirmation-title">{pending.decision === "APPROVED" ? "Approve" : "Reject"} {pending.journey.name}?</h2>
            <p>This records an immutable decision for version {pending.journey.currentVersion}. Approval confirms review completion but does not create unrestricted browser automation.</p>
            <div className="dialogActions"><button className="secondaryButton" disabled={submitting} onClick={() => setPending(null)} type="button">Cancel</button><button disabled={submitting} onClick={saveDecision} type="button">{submitting ? "Saving…" : "Confirm decision"}</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
