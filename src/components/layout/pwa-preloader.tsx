"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PWAPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Hide after a small delay to allow hydration to settle
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Remove from DOM after transition
      const removeTimer = setTimeout(() => setIsRendered(false), 500);
      return () => clearTimeout(removeTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!isRendered) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0f172a] transition-opacity duration-500 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative flex flex-col items-center animate-scale-in">
        <div className="relative size-32 mb-8 group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" />
          <Image
            src="/icon-512.png"
            alt="Sigma Logo"
            width={512}
            height={512}
            className="size-full object-contain relative z-10"
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
            Sigma
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="size-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="size-1 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          initializing workspace
        </p>
      </div>
    </div>
  );
}
