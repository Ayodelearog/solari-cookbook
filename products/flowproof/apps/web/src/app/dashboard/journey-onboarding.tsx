"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Draft = {
  environmentName: string;
  baseUrl: string;
  journeyName: string;
  businessPurpose: string;
  expectedOutcome: string;
  syntheticDataConfirmed: boolean;
};

const initialDraft: Draft = {
  environmentName: "",
  baseUrl: "",
  journeyName: "",
  businessPurpose: "",
  expectedOutcome: "",
  syntheticDataConfirmed: false,
};

export function JourneyOnboarding() {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const update = (field: keyof Draft, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: "1", ...draft, confirmed: true }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const error = typeof body === "object" && body && "error" in body && typeof body.error === "string"
          ? body.error
          : "The journey draft could not be saved.";
        throw new Error(error);
      }
      setDraft(initialDraft);
      setConfirming(false);
      setMessage("Journey submitted for safety and test-design review.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The journey draft could not be saved.");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="onboardingCard" aria-labelledby="onboarding-title">
      <div className="panelHeading">
        <div><p className="eyebrow">Managed onboarding</p><h2 id="onboarding-title">Add a critical journey</h2></div>
        <span className="environmentBadge">Review before execution</span>
      </div>
      <p className="panelCopy">Tell us what must keep working. FlowProof turns this brief into a safe, approved browser journey with explicit assertions.</p>
      <form onSubmit={(event) => { event.preventDefault(); setConfirming(true); window.setTimeout(() => cancelRef.current?.focus(), 0); }}>
        <div className="formGrid">
          <label>Environment name<input required maxLength={80} placeholder="Production storefront" value={draft.environmentName} onChange={(event) => update("environmentName", event.target.value)} /></label>
          <label>Website base URL<input required maxLength={2048} placeholder="https://example.com" type="url" value={draft.baseUrl} onChange={(event) => update("baseUrl", event.target.value)} /></label>
        </div>
        <label>Journey name<input required minLength={3} maxLength={100} placeholder="Customer completes checkout" value={draft.journeyName} onChange={(event) => update("journeyName", event.target.value)} /></label>
        <label>Why this journey matters<textarea required minLength={10} maxLength={500} placeholder="Revenue is lost when customers cannot complete this path." rows={3} value={draft.businessPurpose} onChange={(event) => update("businessPurpose", event.target.value)} /></label>
        <label>Exact successful outcome<textarea required minLength={10} maxLength={500} placeholder="The order confirmation appears with the expected item and total." rows={3} value={draft.expectedOutcome} onChange={(event) => update("expectedOutcome", event.target.value)} /></label>
        <label className="checkboxLabel"><input required checked={draft.syntheticDataConfirmed} type="checkbox" onChange={(event) => update("syntheticDataConfirmed", event.target.checked)} /><span>I will provide only synthetic test identities and data—never real customer data.</span></label>
        <div className="formFooter"><p>No browser run starts from this submission.</p><button type="submit">Review submission</button></div>
      </form>
      {message && <p aria-live="polite" className="formMessage">{message}</p>}

      {confirming && (
        <div className="dialogBackdrop" role="presentation">
          <section aria-describedby="draft-confirmation-copy" aria-labelledby="draft-confirmation-title" aria-modal="true" className="confirmDialog" role="dialog">
            <p className="eyebrow">Confirm saved submission</p>
            <h2 id="draft-confirmation-title">Submit this journey for review?</h2>
            <p id="draft-confirmation-copy">FlowProof will save this website and journey brief to your workspace. It will not visit the site or execute any actions until the journey is reviewed and approved.</p>
            <div className="dialogActions">
              <button ref={cancelRef} className="secondaryButton" disabled={submitting} onClick={() => setConfirming(false)} type="button">Cancel</button>
              <button disabled={submitting} onClick={submit} type="button">{submitting ? "Submitting…" : "Confirm submission"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
