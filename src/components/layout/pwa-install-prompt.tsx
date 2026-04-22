"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Check if user has already dismissed it this session
      const isDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed/running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
      setIsVisible(false);
    } else {
      console.log("User dismissed the PWA install prompt");
    }

    // Clear the deferred prompt variable
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!isVisible || !installPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative flex items-center justify-between gap-4 p-4 bg-card/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground">Install SigmaHR</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add to your home screen for a better experience.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleInstallClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-4 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
