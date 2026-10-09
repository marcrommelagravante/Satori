import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SourceInspector } from "@/components/landing/source-inspector";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CapabilityBento } from "@/components/landing/capability-bento";
import { WorkspaceShowcase } from "@/components/landing/workspace-showcase";
import { UseCases } from "@/components/landing/use-cases";
import { TrustSection } from "@/components/landing/trust-section";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: "Satori — Your knowledge, intelligently connected",
  description:
    "Document knowledge workspace that helps teams find answers across their files and inspect the source passages behind those answers.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-background text-foreground transition-colors">
      <LandingNavbar user={user} />
      <main className="flex-1 flex flex-col">
        {/* 1. Hero: Outcome, problem, primary action & interactive convergence */}
        <HeroSection user={user} />

        {/* 2. Question-to-citation demonstration */}
        <div className="scroll-reveal">
          <SourceInspector />
        </div>

        {/* 3. How it works in user language */}
        <div className="scroll-reveal">
          <HowItWorks />
        </div>

        {/* 4. Capabilities & document grounding */}
        <div className="scroll-reveal">
          <CapabilityBento />
        </div>

        {/* 5. Workspace showcase (realistic application shell) */}
        <div className="scroll-reveal">
          <WorkspaceShowcase user={user} />
        </div>

        {/* 6. Real-world use cases */}
        <div className="scroll-reveal">
          <UseCases />
        </div>

        {/* 7. Trust, privacy & data handling FAQ */}
        <div className="scroll-reveal">
          <TrustSection />
        </div>

        {/* 8. Technical architecture & progressive disclosure */}
        <div className="scroll-reveal">
          <ArchitectureSection />
        </div>

        {/* 9. Final CTA */}
        <div className="scroll-reveal">
          <FinalCta user={user} />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
