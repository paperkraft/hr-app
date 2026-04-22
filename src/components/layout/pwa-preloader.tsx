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
        "fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative flex flex-col items-center animate-scale-in">
        <div className="relative w-56 h-32 mb-8 group">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
          <Image
            src="/app-logo.svg"
            alt="Sigma Logo"
            width={400}
            height={400}
            className="w-full h-full object-contain relative z-10"
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
            <div className="size-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
            <div className="size-1 rounded-full bg-primary/40 animate-bounce" />
          </div>
        </div>

      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          initializing workspace
        </p>
      </div>
    </div>

  );
}
