import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { RunConsole } from "./run-console";

export const metadata = {
  title: "Run a journey — FlowProof",
  description: "Run an approved customer journey in a live Solari cloud browser.",
};

export default function DashboardPage() {
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
        <p className="eyebrow">Control plane preview</p>
        <h2>Run the proof yourself.</h2>
        <p>This first self-service slice executes one allowlisted synthetic journey. Customer accounts, saved history, schedules, and private environments come next.</p>
      </div>
      <RunConsole />
    </main>
  );
}
