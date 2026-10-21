"use client";

import { useState } from "react";
import GlowCard from "@/components/ui/GlowCard";
import { resolveImage } from "@/lib/imageUrl";

/** The 3D picture beside the hero. Shows nothing if there is no image or it can't load. */
export default function HeroImagePanel({ src, alt = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <GlowCard className="h-full min-h-64 overflow-hidden p-4 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImage(src)}
        alt={alt}
        onError={() => setFailed(true)}
        className="max-h-[26rem] w-full object-contain"
      />
    </GlowCard>
  );
}