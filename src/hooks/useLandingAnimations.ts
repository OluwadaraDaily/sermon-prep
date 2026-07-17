import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

export function useLandingAnimations(heroVisualRef: RefObject<HTMLDivElement | null>) {
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            duration: 0.85,
            delay: (index % 3) * 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      if (heroVisualRef.current) {
        gsap.to(heroVisualRef.current, {
          y: 50,
          ease: "none",
          scrollTrigger: {
            trigger: heroVisualRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });

    return () => context.revert();
  }, [heroVisualRef, reduceMotion]);

  return { reduceMotion };
}
