import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { RunConsole } from "./run-console";
import { JourneyOnboarding } from "./journey-onboarding";
import { listOwnedJourneys } from "@/server/journeys/repository";
import { listOwnedRunSummaries } from "@/server/runs/repository";

export const metadata = {
  title: "Run a journey — FlowProof",
  description: "Run an approved customer journey in a live Solari cloud browser.",
};

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  if (!userId) return null;
  const ownerKey = orgId ?? userId;
  const [journeys, recentRuns] = await Promise.all([listOwnedJourneys(ownerKey), listOwnedRunSummaries(ownerKey)]);
  const passedRuns = recentRuns.filter((run) => run.outcome === "PASS").length;
  const completedRuns = recentRuns.filter((run) => run.outcome).length;

  return (
    <main className="dashboardPage">
      <header className="siteHeader">
        <nav aria-label="Dashboard navigation" className="nav">
          <Link className="brand" href="/"><span className="brandMark" aria-hidden="true">F</span>FlowProof</Link>
          <div className="dashboardNavActions">
            <Link className="navLink" href="/#evidence">Reference evidence <span aria-hidden="true">↗</span></Link>
            <UserButton />
          </div>
        </nav>
      </header>
      <div className="dashboardIntro">
        <div className="workspaceLabel"><span className="liveDot" />{orgId ? "Organization workspace" : "Personal workspace"}</div>
        <p className="eyebrow">Journey assurance workspace</p>
        <h2>Know your critical paths still work.</h2>
        <p>Define revenue-critical customer journeys, approve their safety boundaries, run them in real browsers, and retain decision-ready proof.</p>
      </div>
      <div className="commercialShell">
        <section className="metricGrid" aria-label="Workspace summary">
          <div><span>Customer journeys</span><strong>{journeys.length + 1}</strong><small>1 approved reference journey</small></div>
          <div><span>Runs retained</span><strong>{recentRuns.length}</strong><small>Private to this workspace</small></div>
          <div><span>Pass rate</span><strong>{completedRuns ? `${Math.round((passedRuns / completedRuns) * 100)}%` : "—"}</strong><small>{completedRuns ? `${completedRuns} completed run${completedRuns === 1 ? "" : "s"}` : "No completed runs yet"}</small></div>
        </section>

        <div className="dashboardGrid">
          <JourneyOnboarding />
          <section className="journeyListCard" aria-labelledby="journeys-title">
            <div className="panelHeading"><div><p className="eyebrow">Portfolio</p><h2 id="journeys-title">Your journeys</h2></div><span>{journeys.length + 1} total</span></div>
            <article className="journeyListItem">
              <div><span className="status">APPROVED</span><h3>Purchase persistence</h3><p>saucedemo.com · Synthetic reference environment</p></div>
              <small>Runnable now</small>
            </article>
            {journeys.map((journey) => (
              <article className="journeyListItem" key={journey.id}>
                <div><span className="reviewStatus">IN REVIEW</span><h3>{journey.name}</h3><p>{journey.environment.hostname} · {journey.environment.name}</p></div>
                <small>Version {journey.currentVersion}</small>
              </article>
            ))}
            {journeys.length === 0 && <p className="emptyHint">Your first submitted journey will appear here with its review status.</p>}
          </section>
        </div>

        <section className="sectionDivider"><p className="eyebrow">Approved execution</p><h2>Run a live reference journey</h2><p>This allowlisted journey proves the complete FlowProof path: authenticated request, durable Solari execution, persisted result, and private evidence.</p></section>
        <RunConsole />

        <section className="historyCard" aria-labelledby="history-title">
          <div className="panelHeading"><div><p className="eyebrow">Audit trail</p><h2 id="history-title">Recent runs</h2></div><span>Last 10</span></div>
          {recentRuns.length > 0 ? <div className="historyList">{recentRuns.map((run) => (
            <article key={run.id}>
              <div><strong>{run.journeyName}</strong><span>{new Date(run.createdAt).toLocaleString()}</span></div>
              <span className="status" data-outcome={run.outcome ?? "INCONCLUSIVE"}>{run.outcome ?? run.state}</span>
            </article>
          ))}</div> : <p className="emptyHint">Run the approved journey to create your first retained report.</p>}
        </section>
      </div>
    </main>
  );
}
