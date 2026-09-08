import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { listJourneyReviewQueue } from "@/server/journeys/repository";
import { isFlowProofOperator } from "@/server/operators";
import { ReviewQueue } from "./review-queue";

export const metadata = { title: "Journey reviews — FlowProof" };

export default async function OperatorPage() {
  const { userId } = await auth();
  if (!isFlowProofOperator(userId)) notFound();
  const journeys = await listJourneyReviewQueue();

  return (
    <main className="dashboardPage">
      <header className="siteHeader"><nav aria-label="Operator navigation" className="nav"><Link className="brand" href="/"><span className="brandMark" aria-hidden="true">F</span>FlowProof</Link><Link className="navLink" href="/dashboard">Customer dashboard</Link></nav></header>
      <div className="dashboardIntro"><div className="workspaceLabel"><span className="liveDot" />Operator workspace</div><p className="eyebrow">Managed assurance</p><h1>Journey review queue</h1><p>Review domains, declared effects, synthetic data, deterministic assertions, cleanup, and budgets before recording a decision.</p></div>
      <div className="commercialShell"><section className="reviewNotice"><strong>Approval is a safety gate, not an execution shortcut.</strong><p>Approved customer briefs still require a server-defined journey specification before they can enter the run queue.</p></section><ReviewQueue journeys={journeys} /></div>
    </main>
  );
}
