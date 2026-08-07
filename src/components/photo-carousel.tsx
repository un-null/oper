"use client";

import { IconChevronLeft, IconChevronRight, IconPhoto } from "@tabler/icons-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";

type PhotoCarouselProps = {
  photoUrls: string[];
  alt: string;
  children?: ReactNode;
};

export function PhotoCarousel({ alt, children, photoUrls }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);

  return (
    <div className="border-border bg-accent-soft text-accent-soft-foreground rounded-stub group relative aspect-[4/3] overflow-hidden border">
      {photoUrls.length > 0 ? (
        <Image
          alt={alt}
          className="object-cover object-top"
          fill
          priority={index === 0}
          sizes="(min-width: 640px) 672px, 100vw"
          src={photoUrls[index]}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <IconPhoto className="h-20 w-20" />
        </div>
      )}

      {children}

      {photoUrls.length > 1 ? (
        <>
          <button
            aria-label="Previous photo"
            className="bg-background/80 hover:bg-background absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() =>
              setIndex((current) => (current - 1 + photoUrls.length) % photoUrls.length)
            }
            type="button"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next photo"
            className="bg-background/80 hover:bg-background absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => setIndex((current) => (current + 1) % photoUrls.length)}
            type="button"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photoUrls.map((url, i) => (
              <button
                aria-current={i === index}
                aria-label={`Photo ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-foreground" : "bg-background/80"
                }`}
                key={url}
                onClick={() => setIndex(i)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
