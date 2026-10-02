"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RunnerGameCanvas, RunnerGameState } from "@/components/login/RunnerGameCanvas";
import { ArrowRight, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [gameState, setGameState] = useState<RunnerGameState>("RUNNING");
  const [loginError, setLoginError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSprintComplete = useCallback(() => {
    // Store mock session in localStorage / cookies
    const isCore =
      identifier.toLowerCase().includes("lead") ||
      identifier.toLowerCase().includes("core") ||
      identifier.toLowerCase().includes("arjun");
    const sessionData = {
      name: isCore ? "Arjun Mehta (Lead)" : "Kaelen Voss",
      email: identifier || "engineer@nexus.org",
      role: isCore ? "CORE" : "MEMBER",
      department: "Technical",
    };
    try {
      localStorage.setItem("nexus-session", JSON.stringify(sessionData));
    } catch (e) {
      console.error(e);
    }
    router.push("/dashboard");
  }, [identifier, router]);

  const triggerFail = (msg: string) => {
    setIsProcessing(false);
    setLoginError(msg);
    setGameState("FAIL_CRASH");
  };

  const handleResetGame = () => {
    if (gameState === "FAIL_CRASH") {
      setGameState("RUNNING");
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!identifier.trim() || !password.trim()) {
      triggerFail("Identifier and password required.");
      return;
    }

    setIsProcessing(true);

    // Test credentials check:
    setTimeout(() => {
      // Intentional failure test check: if password is "fail" or "error", simulate crash
      if (password.toLowerCase() === "fail" || password.toLowerCase() === "error") {
        triggerFail("Invalid security credentials. Access denied.");
        return;
      }

      // Success sprint!
      setIsProcessing(false);
      setGameState("SUCCESS_SPRINT");
    }, 500);
  };

  const fillQuickCreds = (role: "lead" | "member") => {
    if (role === "lead") {
      setIdentifier("arjun@nexus.org");
      setPassword("nexus-core-2026");
    } else {
      setIdentifier("kaelen@nexus.org");
      setPassword("nexus-dev-2026");
    }
    handleResetGame();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {/* 1. Full-Bleed Monochromatic 8-Bit Runner Canvas Background */}
      <RunnerGameCanvas
        gameState={gameState}
        onSuccessComplete={handleSprintComplete}
      />

      {/* 2. Top-Left Discreet Return Link */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/"
          className="text-xs font-mono text-neutral-400 hover:text-white px-3.5 py-1.5 rounded-sm border border-white/15 bg-black/80 backdrop-blur-sm transition-colors"
        >
          ← BACK TO NEXUS
        </Link>
      </div>

      {/* 3. The Login Gate Container (Havu Monochromatic Brutalism) */}
      <div className="relative z-20 flex h-full items-center justify-center p-4 pointer-events-none">
        <div
          className={`w-full max-w-sm p-6 sm:p-8 rounded-sm border transition-all duration-300 bg-[#09090b]/92 backdrop-blur-md shadow-2xl pointer-events-auto ${
            gameState === "FAIL_CRASH"
              ? "border-red-500/80 shadow-[0_0_40px_rgba(255,50,50,0.25)] animate-shake"
              : "border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
          }`}
        >
          {/* Logo Mark & Header */}
          <div className="text-center mb-6">
            <span className="font-mono text-xs font-bold tracking-caps-lg text-neutral-400 uppercase">
              NEXUS GATEWAY
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              Credential Access
            </h1>
          </div>

          {loginError && (
            <div className="mb-4 p-2.5 border border-red-500/50 bg-red-950/30 rounded-sm flex items-center gap-2 text-xs font-mono text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Identifier / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (gameState === "FAIL_CRASH") handleResetGame();
                  }}
                  placeholder="name@nexus.org"
                  className="w-full pl-9 pr-3 py-2 bg-black border border-white/20 rounded-sm text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (gameState === "FAIL_CRASH") handleResetGame();
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-black border border-white/20 rounded-sm text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || gameState === "SUCCESS_SPRINT"}
              className="w-full mt-2 py-2.5 rounded-sm bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {gameState === "SUCCESS_SPRINT" ? (
                <span>SYNCHRONIZING SPRINT...</span>
              ) : isProcessing ? (
                <span>VALIDATING...</span>
              ) : (
                <>
                  <span>ENTER DASHBOARD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              QUICK ROLES PRESETS:
            </p>
            <div className="flex items-center justify-center gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => fillQuickCreds("lead")}
                className="px-2.5 py-1 rounded-sm border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                Lead (Core Reviewer)
              </button>
              <button
                type="button"
                onClick={() => fillQuickCreds("member")}
                className="px-2.5 py-1 rounded-sm border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                Member (Kaelen)
              </button>
            </div>
            <p className="text-[9px] font-mono text-neutral-600 pt-1">
              Tip: Enter password &quot;fail&quot; to test crawler death animation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
