import { Typography } from "@heroui/react";
import Image from "next/image";

export function HomeHero() {
  // min-h floor per breakpoint. The artwork is 2.044:1, so in the md 2-column layout it
  // collapses to ~147px tall at 768px — the section's shortest point despite the wider
  // viewport, which is what made the band read as low. The floor gives it presence and
  // the image is free to sit smaller inside it.
  return (
    <section className="bg-washi text-washi-foreground border-washi-border rounded-stub relative min-h-[420px] overflow-hidden border px-6 py-10 sm:min-h-[480px] sm:px-10 sm:py-14 md:grid md:min-h-[380px] md:grid-cols-2 md:items-center md:gap-10 lg:min-h-[420px]">
      <div aria-hidden className="hero-grain absolute inset-0" />
      <div className="relative">
        <Typography.Heading
          className="text-washi-foreground font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          level={1}
        >
          Someone nearby needs it more than your closet does.
        </Typography.Heading>
      </div>
      <Image
        alt="One hand lowering a small stool into another hand waiting to receive it"
        className="relative mt-8 h-auto w-full md:mt-0"
        height={588}
        priority
        sizes="(min-width: 1280px) 516px, (min-width: 768px) 45vw, 100vw"
        src="/hero.png"
        width={1202}
      />
    </section>
  );
}
