"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Nexus3DLogo } from "./Nexus3DLogo";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function LandingSections() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      {/* Fixed Minimal Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-hairline/60 bg-paper/75 backdrop-blur-md transition-colors duration-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-caps-lg text-ink uppercase">
            NEXUS
          </span>
          <span className="text-[11px] font-mono text-muted hidden sm:inline">
            {/* AARVAK SPRINT COHORT */}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 border border-hairline rounded-full hover:border-ink transition-colors text-ink"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full border border-hairline bg-ink text-onink font-mono text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
          >
            DASHBOARD GATE →
          </Link>
        </div>
      </header>

      {/* Persistent 3D Logo Viewport Layer */}
      {/* Sits fixed in the background/foreground, moving across Right -> Left -> Center based on scrollProgress */}
      <div className="fixed inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="w-full max-w-7xl h-full relative">
          <Nexus3DLogo scrollProgress={scrollProgress} />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: NEXUS (Logo on Right) */}
      {/* ------------------------------------------------------------- */}
      <section
        id="section-1"
        className="relative z-30 min-h-screen flex items-center px-6 sm:px-16 lg:px-24 py-24 pointer-events-none"
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content (Left side in Section 1, strictly constrained to left half) */}
          <div className="space-y-6 max-w-lg lg:pr-8 pointer-events-auto">
            <div className="space-y-1">
              <span className="hv-kicker text-xs text-muted">
                SECTION 01 // TEAM SPECIFICATION
              </span>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-ink">
                Nexus
              </h1>
            </div>

            <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
              Nexus is an engineering team formed to design, build, and grow software together. 
              We focus on clean architecture, systems thinking, and technical craft without superficial noise or artificial marketing gloss.
            </p>

            <div className="pt-4 flex items-center gap-6 font-mono text-xs text-muted">
              <div>
                <p className="text-ink font-bold text-sm">10</p>
                <p className="text-[10px] uppercase tracking-wider">Engineers & Guides</p>
              </div>
              <div className="w-px h-8 bg-hairline" />
              <div>
                <p className="text-ink font-bold text-sm">#1</p>
                <p className="text-[10px] uppercase tracking-wider">Sprint Standing</p>
              </div>
              <div className="w-px h-8 bg-hairline" />
              <div>
                <p className="text-ink font-bold text-sm">2,120</p>
                <p className="text-[10px] uppercase tracking-wider">Verified Points</p>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-[11px] font-mono text-muted flex items-center gap-2">
                <span>SCROLL TO EXPLORE WORK</span>
                <span className="animate-bounce">↓</span>
              </span>
            </div>
          </div>

          {/* Spacer for 3D Logo on Right */}
          <div className="hidden lg:block h-96 pointer-events-none" />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: OUR WORK (Logo on Left) */}
      {/* ------------------------------------------------------------- */}
      <section
        id="section-2"
        className="relative z-30 min-h-screen flex items-center px-6 sm:px-16 lg:px-24 py-24 pointer-events-none"
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Spacer for 3D Logo on Left */}
          <div className="hidden lg:block h-96 pointer-events-none" />

          {/* Text Content (Right side in Section 2, strictly constrained to right half) */}
          <div className="space-y-6 max-w-lg lg:pl-8 lg:ml-auto pointer-events-auto">
            <div className="space-y-1">
              <span className="hv-kicker text-xs text-muted">
                SECTION 02 // SPRINT OPERATIONS
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
                Our Work
              </h2>
            </div>

            <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
              Nexus is competing in the AARVAK tech sprint, an engineering competition where autonomous teams tackle weekly technical milestones.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 border border-hairline rounded-sm bg-paper/80 backdrop-blur-sm">
                <span className="font-mono text-[10px] text-emerald-600 font-bold uppercase">
                  WEEK 1 // COMPLETED (980 PTS)
                </span>
                <h4 className="font-bold text-sm text-ink mt-0.5">
                  Identity, 3D Hexagonal Jewel & Dashboard Engine
                </h4>
                <p className="text-xs text-muted mt-1 font-mono">
                  Constructed the procedural 3D logo, tokenized Havu design system, and two-tier ingestion backend.
                </p>
              </div>

              <div className="p-4 border border-ink/40 rounded-sm bg-paper/80 backdrop-blur-sm">
                <span className="font-mono text-[10px] text-blue-500 font-bold uppercase">
                  WEEK 2 // ACTIVE IN PROGRESS (1,140 PTS)
                </span>
                <h4 className="font-bold text-sm text-ink mt-0.5">
                  Open-Source Contributions & Upstream Sync
                </h4>
                <p className="text-xs text-muted mt-1 font-mono">
                  Merging upstream PRs, performance profiling, and distributed RPC audit verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: WELCOME TO NEXUS (Logo in Upper Center) */}
      {/* ------------------------------------------------------------- */}
      <section
        id="section-3"
        className="relative z-30 min-h-screen flex flex-col justify-end items-center text-center px-6 sm:px-12 pb-24 pt-80 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto space-y-6 pointer-events-auto mt-auto">
          <span className="hv-kicker text-xs text-muted">
            SECTION 03 // ACCESS GATEWAY
          </span>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
            Welcome to Nexus
          </h2>

          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-lg mx-auto font-sans">
            Enter the authenticated team console to monitor sprint telemetry, audit member contributions, or submit verified engineering milestones.
          </p>

          <div className="pt-4">
            <Link
              href="/login"
              id="enter-nexus-dashboard-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-ink text-onink font-mono text-xs sm:text-sm font-bold tracking-wider uppercase hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl cursor-pointer pointer-events-auto"
            >
              <span>ENTER THE NEXUS DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-2 text-[11px] font-mono text-muted">
            Authenticated via Supabase • Role-aware Core verification
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-30 border-t border-hairline py-8 px-6 sm:px-16 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted bg-paper">
        <div>NEXUS // AARVAK SPRINT COHORT 2026</div>
        <div className="mt-2 sm:mt-0">DESIGNED WITH ZERO AI-SLOP • MONOCHROME BRUTALISM</div>
      </footer>
    </div>
  );
}
