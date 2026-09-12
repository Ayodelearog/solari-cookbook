import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { RunConsole, type RunnableJourney } from "./run-console";
import { JourneyOnboarding } from "./journey-onboarding";
import { listOwnedJourneys } from "@/server/journeys/repository";
import { listOwnedRunSummaries } from "@/server/runs/repository";
import { isFlowProofOperator } from "@/server/operators";

export const metadata = {
  title: "Run a journey | FlowProof",
  description: "Run an approved customer journey in a live Solari cloud browser.",
};

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  if (!userId) return null;
  const ownerKey = orgId ?? userId;
  const [journeys, recentRuns] = await Promise.all([listOwnedJourneys(ownerKey), listOwnedRunSummaries(ownerKey)]);
  const passedRuns = recentRuns.filter((run) => run.outcome === "PASS").length;
  const completedRuns = recentRuns.filter((run) => run.outcome).length;
  const runnableJourneys: RunnableJourney[] = journeys.filter((journey) => journey.runnable).map((journey) => ({
    id: journey.id,
    name: journey.name,
    description: journey.businessPurpose,
    target: journey.environment.hostname,
    actions: "Open page · verify exact visible text",
    expected: journey.executableExpected ?? journey.expectedOutcome,
    environment: journey.environment.name,
    kind: "customer",
  }));

  return (
    <main className="dashboardPage">
      <header className="siteHeader">
        <nav aria-label="Dashboard navigation" className="nav">
          <Link className="brand" href="/"><span className="brandMark" aria-hidden="true">F</span>FlowProof</Link>
          <div className="dashboardNavActions">
            {isFlowProofOperator(userId) ? <Link className="navLink" href="/operator">Review queue</Link> : null}
            <Link className="navLink" href="/">Product site</Link>
            <UserButton />
          </div>
        </nav>
      </header>
      <div className="dashboardIntro">
        <div>
          <div className="workspaceLabel"><span className="liveDot" />{orgId ? "Organization workspace" : "Personal workspace"}</div>
          <h1>Your journeys</h1>
          <p>Run an approved customer path or add the next one you need to protect.</p>
        </div>
        <dl className="dashboardStats" aria-label="Workspace summary">
          <div><dt>Journeys</dt><dd>{journeys.length + 1}</dd></div>
          <div><dt>Recent runs</dt><dd>{recentRuns.length}</dd></div>
          <div><dt>Pass rate</dt><dd>{completedRuns ? `${Math.round((passedRuns / completedRuns) * 100)}%` : "Not set"}</dd></div>
        </dl>
      </div>
      <div className="commercialShell">
        <JourneyOnboarding />

        <section className="runnableSection" aria-labelledby="ready-title">
          <div className="dashboardSectionHeading">
            <div><p className="eyebrow">Ready</p><h2 id="ready-title">Run a journey</h2></div>
            <p>Every run uses its approved target and success condition.</p>
          </div>
          <div className="runnerList">
            <RunConsole />
            {runnableJourneys.map((journey) => <RunConsole journey={journey} key={journey.id} />)}
          </div>
        </section>

        {journeys.some((journey) => !journey.runnable) ? <section className="pendingJourneys" aria-labelledby="pending-title">
          <div className="dashboardSectionHeading"><div><p className="eyebrow">Pending</p><h2 id="pending-title">In review</h2></div></div>
          {journeys.filter((journey) => !journey.runnable).map((journey) => <article className="journeyListItem" key={journey.id}><div><span className="reviewStatus" data-status={journey.status}>{journey.status === "DRAFT_REVIEW" ? "IN REVIEW" : journey.status}</span><h3>{journey.name}</h3><p>{journey.environment.hostname}</p></div><small>Version {journey.currentVersion}</small></article>)}
        </section> : null}

        <section className="historyCard" aria-labelledby="history-title">
          <div className="panelHeading"><div><p className="eyebrow">Activity</p><h2 id="history-title">Recent runs</h2></div><span>Latest 5</span></div>
          {recentRuns.length > 0 ? <div className="historyList">{recentRuns.slice(0, 5).map((run) => (
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
