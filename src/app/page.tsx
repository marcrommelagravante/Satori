import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CapabilityBento } from "@/components/landing/capability-bento";
import { SourceInspector } from "@/components/landing/source-inspector";
import { WorkspaceShowcase } from "@/components/landing/workspace-showcase";
import { UseCases } from "@/components/landing/use-cases";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: "Satori — Your knowledge, intelligently connected",
  description:
    "Turn scattered team documents into a searchable knowledge workspace where every answer cites its exact source.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F6] dark:bg-background text-foreground transition-colors">
      <LandingNavbar user={user} />
      <main className="flex-1 flex flex-col">
        <HeroSection user={user} />
        <div className="scroll-reveal">
          <HowItWorks />
        </div>
        <div className="scroll-reveal">
          <CapabilityBento />
        </div>
        <div className="scroll-reveal">
          <SourceInspector />
        </div>
        <div className="scroll-reveal">
          <WorkspaceShowcase user={user} />
        </div>
        <div className="scroll-reveal">
          <UseCases />
        </div>
        <div className="scroll-reveal">
          <ArchitectureSection />
        </div>
        <div className="scroll-reveal">
          <FinalCta user={user} />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
