"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { MemberProfile } from "@/lib/members-data";
import { fetchMembers } from "@/lib/supabase-data";
import { AsciiMorphismAvatar } from "@/components/dashboard/AsciiMorphismAvatar";
import { GitHubContributionCalendar } from "@/components/dashboard/GitHubContributionCalendar";
import { useTheme } from "@/lib/theme";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Award,
  Activity,
  GitBranch,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Flame,
  Cpu,
} from "lucide-react";

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [membersList, setMembersList] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers().then((res) => {
      setMembersList(res);
      setIsLoading(false);
    });
  }, []);

  // Active filter for achievements
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  if (isLoading) {
    return <div className="min-h-screen bg-paper text-ink flex items-center justify-center font-mono text-sm tracking-widest">SYNCHRONIZING DOSSIER...</div>;
  }

  // Find the member
  const memberIndex = membersList.findIndex((m) => m.id === resolvedParams.id);
  if (memberIndex === -1) {
    notFound();
  }
  const member = membersList[memberIndex];

  // Previous & Next member navigation
  const prevMember =
    membersList[(memberIndex - 1 + membersList.length) % membersList.length];
  const nextMember =
    membersList[(memberIndex + 1) % membersList.length];

  const categories = ["ALL", ...Array.from(new Set(member.achievements.map((a) => a.category)))];

  const filteredAchievements =
    selectedCategory === "ALL"
      ? member.achievements
      : member.achievements.filter((a) => a.category === selectedCategory);

  return (
    <div className="min-h-screen w-full bg-paper text-ink transition-colors duration-300">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAV BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-paper/85 backdrop-blur-md px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Return Link */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-hairline font-mono text-xs text-muted hover:text-ink hover:border-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TEAM DASHBOARD</span>
          </Link>

          <span className="text-muted/40 hidden sm:inline">|</span>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-muted">
            <span>TEAM</span>
            <span>/</span>
            <span>MEMBERS</span>
            <span>/</span>
            <span className="text-ink font-bold">{member.name}</span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Member Prev/Next Switcher */}
          <div className="flex items-center border border-hairline rounded-sm overflow-hidden font-mono text-xs">
            <button
              onClick={() => router.push(`/dashboard/members/${prevMember.id}`)}
              className="p-1.5 hover:bg-ink/5 text-muted hover:text-ink transition-colors flex items-center gap-1 px-2 border-r border-hairline"
              title={`Previous: ${prevMember.name}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{prevMember.name.split(" ")[0]}</span>
            </button>
            <span className="px-2.5 py-1 text-[11px] text-ink font-bold bg-ink/[0.02]">
              {memberIndex + 1} / {membersList.length}
            </span>
            <button
              onClick={() => router.push(`/dashboard/members/${nextMember.id}`)}
              className="p-1.5 hover:bg-ink/5 text-muted hover:text-ink transition-colors flex items-center gap-1 px-2 border-l border-hairline"
              title={`Next: ${nextMember.name}`}
            >
              <span className="hidden md:inline">{nextMember.name.split(" ")[0]}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 border border-hairline rounded-full hover:border-ink transition-colors"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN DOSSIER LAYOUT (SPLIT 2 COLUMNS) */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDE: THE ASCII MORPHISM AVATAR & HERO DOSSIER */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* The Centerpiece Interactive ASCII Morphism Avatar */}
            <div className="p-4 rounded-sm border border-hairline bg-paper/80 backdrop-blur-sm shadow-sm space-y-4">
              <AsciiMorphismAvatar avatarUrl={member.avatarUrl} name={member.name} />

              {/* Member Title & Identification */}
              <div className="pt-2 border-t border-hairline space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="hv-kicker text-[10px] px-2 py-0.5 rounded border border-hairline bg-ink/5">
                      {member.isLeader ? "LEADER // ADVISOR" : `RANK #${member.rank}`}
                    </span>
                    <span className="hv-kicker text-[10px] text-muted">
                      {member.department} GUILD
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs text-amber-500 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{member.streakDays}d Streak</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  {member.name}
                </h1>
                <p className="font-mono text-xs text-muted">
                  {member.role} • {member.specialization}
                </p>
              </div>

              {/* Bio Statement */}
              <p className="text-sm text-ink/90 leading-relaxed font-sans border-t border-hairline/60 pt-3">
                {member.bio}
              </p>

              {/* Telemetry Snapshot Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-center">
                <div className="p-2 border border-hairline rounded bg-ink/[0.02]">
                  <span className="text-[10px] text-muted block uppercase">
                    {member.isLeader ? "ROLE" : "POINTS"}
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {member.isLeader ? "MENTOR" : `${member.points} PTS`}
                  </span>
                </div>
                <div className="p-2 border border-hairline rounded bg-ink/[0.02]">
                  <span className="text-[10px] text-muted block uppercase">TASKS</span>
                  <span className="text-sm font-bold text-ink">
                    {member.isLeader ? "12 Sprints" : `${member.achievements?.length || 0} Done`}
                  </span>
                </div>
                <div className="p-2 border border-hairline rounded bg-ink/[0.02]">
                  <span className="text-[10px] text-muted block uppercase">COMMITS</span>
                  <span className="text-sm font-bold text-ink">
                    {member.achievements?.length || 0} Total
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Department / Tech Spec Card */}
            <div className="p-4 rounded-sm border border-hairline bg-paper/60 backdrop-blur-sm space-y-2.5 font-mono text-xs">
              <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
                SYSTEM CREDENTIALS
              </span>
              <div className="flex items-center justify-between text-muted">
                <span>IDENTITY ID:</span>
                <span className="text-ink font-semibold">{member.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>GITHUB:</span>
                <a
                  href={`https://github.com/${member.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:underline font-semibold flex items-center gap-1"
                >
                  <span>@{member.githubUsername}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>VERIFICATION AUTH:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CRYPTOGRAPHIC ACTIVE</span>
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: THE 3 CORE DASHBOARD SECTIONS */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* ------------------------------------------------------- */}
            {/* SECTION 1: GITHUB-STYLE CONTRIBUTION CALENDAR */}
            {/* ------------------------------------------------------- */}
            <section id="section-activity" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="hv-kicker text-xs text-muted">
                  SECTION 01 // TELEMETRY ACTIVITY
                </span>
                <span className="text-[11px] font-mono text-muted">
                  FULL HISTORY • HOVER TO AUDIT
                </span>
              </div>

              {/* The Real GitHub-Style Activity Chart */}
              <GitHubContributionCalendar member={member} />
            </section>

            {/* ------------------------------------------------------- */}
            {/* SECTION 2: PARTICIPATION AREA & ACHIEVEMENTS */}
            {/* ------------------------------------------------------- */}
            <section id="section-achievements" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-hairline">
                <div>
                  <span className="hv-kicker text-xs text-muted">
                    SECTION 02 // SPRINT PARTICIPATION
                  </span>
                  <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2 mt-0.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Verified Engineering Achievements ({member.achievements.length})</span>
                  </h2>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 font-mono text-[10px] overflow-x-auto max-w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded border transition-colors ${selectedCategory === cat
                        ? "border-ink bg-ink text-onink font-bold"
                        : "border-hairline text-muted hover:text-ink"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Achievement Badges List */}
              <div className="grid grid-cols-1 gap-3">
                {filteredAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-sm border border-hairline bg-paper/80 backdrop-blur-sm hover:border-ink/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-hairline bg-ink/5 uppercase font-bold text-ink">
                          {ach.category}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          {ach.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-ink">{ach.title}</h4>
                      <p className="text-[11px] font-mono text-muted">
                        Verification Hash:{" "}
                        <span className="text-ink font-semibold">
                          0x{ach.id.replace(/[^0-9a-f]/g, "a")}4f...8c
                        </span>{" "}
                        • Signed by Core Architecture Committee
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
                      <span className="px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        +{ach.points} PTS
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sprint Progression Milestone Bar */}
              {(() => {
                const pts = member.points ?? 0;
                const levels = [
                  { level: 1, label: "RECRUIT", min: 0, max: 50 },
                  { level: 2, label: "CONTRIBUTOR", min: 50, max: 150 },
                  { level: 3, label: "SPECIALIST", min: 150, max: 300 },
                  { level: 4, label: "SENIOR", min: 300, max: 500 },
                  { level: 5, label: "ELITE", min: 500, max: 800 },
                  { level: 6, label: "LEGENDARY", min: 800, max: Infinity },
                ];
                const current = levels.find(l => pts >= l.min && pts < l.max) ?? levels[levels.length - 1];
                const nextLevel = levels.find(l => l.level === current.level + 1);
                const progressPct = nextLevel
                  ? Math.min(100, Math.round(((pts - current.min) / (current.max - current.min)) * 100))
                  : 100;
                return (
                  <div className="p-4 rounded-sm border border-hairline bg-ink/[0.02] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-ink">
                        SPRINT LEVEL {current.level} {"//"} COHORT {current.label}
                      </span>
                      <span className="text-muted">
                        {nextLevel
                          ? `${pts} / ${current.max} PTS TO LEVEL ${nextLevel.level}`
                          : `${pts} PTS — MAX LEVEL`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-hairline overflow-hidden">
                      <div
                        className="h-full bg-ink rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* ------------------------------------------------------- */}
            {/* SECTION 3: CURRENT STATUS & LIVE TELEMETRY */}
            {/* ------------------------------------------------------- */}
            <section id="section-status" className="space-y-4">
              <div className="pb-2 border-b border-hairline">
                <span className="hv-kicker text-xs text-muted">
                  SECTION 03 // CURRENT TELEMETRY STATUS
                </span>
                <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2 mt-0.5">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Real-Time Engineering Status</span>
                </h2>
              </div>

              {/* Status Telemetry Dashboard Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Task & Branch */}
                <div className="p-4 rounded-sm border border-hairline bg-paper/80 backdrop-blur-sm space-y-2 font-mono text-xs">
                  <span className="text-[10px] text-muted uppercase tracking-wider block font-bold flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                    ACTIVE BRANCH & WORKING PR
                  </span>
                  <p className="text-sm font-bold text-ink truncate">
                    feature/distributed-rpc-sync
                  </p>
                  <p className="text-muted text-[11px] flex items-center gap-1">
                    <GitPullRequest className="w-3 h-3 text-purple-400" />
                    <span>PR #412: Outbox Pattern Verification</span>
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-500 font-bold">
                      IN REVIEW
                    </span>
                    <span className="text-muted">Last push: 22 mins ago</span>
                  </div>
                </div>

                {/* System State & Focus Mode */}
                <div className="p-4 rounded-sm border border-hairline bg-paper/80 backdrop-blur-sm space-y-2 font-mono text-xs">
                  <span className="text-[10px] text-muted uppercase tracking-wider block font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    AGENT & RUNTIME STATE
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>ONLINE // DEEP WORK MODE</span>
                  </div>
                  <p className="text-muted text-[11px]">
                    Assigned Guild: {member.department} Core Ingestion
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                      SPRINT VELOCITY: 8.4 PTS / DAY
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Specific Audit Stream Log */}
              <div className="p-4 rounded-sm border border-hairline bg-paper/60 backdrop-blur-sm space-y-3">
                <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-muted" />
                  Recent Sprint Audit Trail
                </span>

                <div className="space-y-2 font-mono text-xs">
                  {member.recentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-hairline/60 bg-ink/[0.02] flex items-start gap-2.5 text-muted"
                    >
                      <span className="text-ink font-bold whitespace-nowrap">
                        [{log.date}]
                      </span>
                      <span className="text-ink/90 flex-1">{log.message}</span>
                      <span className="text-[10px] text-emerald-500 font-bold shrink-0">
                        AUDITED ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
