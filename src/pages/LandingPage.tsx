import { useRef } from "react";

import { CustomCursor } from "../components/common/CustomCursor";
import { EarlyAccessSection } from "../components/landing/EarlyAccessSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { SiteFooter } from "../components/landing/SiteFooter";
import { SiteHeader } from "../components/landing/SiteHeader";
import { TestimonialsSection } from "../components/landing/TestimonialsSection";
import { TrustStrip } from "../components/landing/TrustStrip";
import { useLandingAnimations } from "../hooks/useLandingAnimations";

export function LandingPage() {
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const { reduceMotion } = useLandingAnimations(heroVisualRef);

  return (
    <div className="site-shell">
      <CustomCursor />
      <SiteHeader />
      <main>
        <HeroSection reduceMotion={reduceMotion} visualRef={heroVisualRef} />
        <TrustStrip />
        <FeaturesSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <EarlyAccessSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
