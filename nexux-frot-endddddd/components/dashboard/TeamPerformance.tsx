"use client";

import React from "react";
import Image from "next/image";
import { TeamStanding } from "@/lib/competition-data";
import { Trophy, TrendingUp, Target, Layers } from "lucide-react";

import { MemberProfile } from "@/lib/members-data";

interface TeamPerformanceProps {
  standing: TeamStanding;
  members: MemberProfile[];
  currentUser: { name: string; role: string };
}

export function TeamPerformance({ standing, members, currentUser }: TeamPerformanceProps) {
  const userProfile = members.find(m => m.name.toLowerCase() === currentUser.name.toLowerCase());
  const isLeader = userProfile?.isLeader;
  const memberRank = userProfile?.rank || (isLeader ? "LEAD" : "-");
  const totalMembers = members.filter(m => !m.isLeader).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Standing */}
        <div className="p-5 border border-hairline rounded-sm bg-paper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="hv-kicker text-[10px]">YOUR SPRINT RANK</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold font-mono text-ink tracking-tight flex items-baseline gap-1">
              {memberRank !== "LEAD" ? `#${memberRank}` : "LEAD"}
              <span className="text-xs text-muted font-normal">
                / {totalMembers} MEMBERS
              </span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />Personal Growth
            </p>
          </div>
          <div className="pt-2 border-t border-hairline text-[11px] text-muted font-mono">
            AARVAK Official Leaderboard
          </div>
        </div>

        {/* 2. Total Points */}
        <div className="p-5 border border-hairline rounded-sm bg-paper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="hv-kicker text-[10px]">TOTAL VERIFIED SCORE</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold font-mono text-ink tracking-tight">
              {standing.totalScore.toLocaleString()}
              <span className="text-sm text-muted font-normal ml-1">PTS</span>
            </div>
            <p className="text-xs text-muted font-mono mt-1">
              {standing.gapToFirst === 0
                ? "HOLDING 1ST PLACE"
                : `${standing.gapToFirst} pts behind leader`}
            </p>
          </div>
          <div className="pt-2 border-t border-hairline text-[11px] text-muted font-mono">
            Synced via Supabase RPC
          </div>
        </div>

        {/* 3. Top Contributor */}
        <div className="p-5 border border-hairline rounded-sm bg-paper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="hv-kicker text-[10px]">TOP CONTRIBUTOR</span>
            <span className="hv-kicker text-[9px] text-amber-500 font-bold">MVP</span>
          </div>
          <div className="my-3 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-sm border border-hairline overflow-hidden bg-black shrink-0">
              <Image
                src={standing.topContributor.avatarUrl}
                alt={standing.topContributor.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">{standing.topContributor.name}</p>
              <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {standing.topContributor.points} PTS
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-hairline text-[11px] text-muted font-mono">
            Technical & WebGL Specialist
          </div>
        </div>

        {/* 4. Active Sprint Status */}
        <div className="p-5 border border-hairline rounded-sm bg-paper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="hv-kicker text-[10px]">CURRENT TRACK</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-3">
            <div className="text-lg font-bold text-ink">Week 2: Open Source</div>
            <p className="text-xs text-muted font-mono mt-1">
              Active Focus: Merged PRs & Community
            </p>
          </div>
          <div className="pt-2 border-t border-hairline text-[11px] text-muted font-mono">
            Ends: Sunday 23:59 UTC
          </div>
        </div>
      </div>

      {/* Main Progression Grid: Weekly Progression + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progression Graph (2 Columns) */}
        <div className="lg:col-span-2 p-6 border border-hairline rounded-sm bg-paper">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-ink tracking-tight">
                Weekly Progression & Milestone Velocity
              </h3>
              <p className="text-xs text-muted font-mono mt-0.5">
                Week-by-week scoring trend across the AARVAK tech sprint
              </p>
            </div>
            <span className="hv-kicker text-[10px] px-2 py-0.5 rounded border border-hairline">
              2 / 4 WEEKS ACTIVE
            </span>
          </div>

          <div className="space-y-6">
            {standing.weeklyProgression.map((item, idx) => {
              const pct = Math.min(100, Math.round((item.points / item.target) * 100));
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{item.week}</span>
                      <span className="text-muted">({item.title})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{item.points} PTS</span>
                      <span className="text-muted">/ {item.target} target</span>
                      {item.status === "completed" && (
                        <span className="text-[10px] text-emerald-600 font-bold ml-1">
                          [CLEARED]
                        </span>
                      )}
                      {item.status === "current" && (
                        <span className="text-[10px] text-amber-500 font-bold ml-1">
                          [ACTIVE]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Hairline Progress Track */}
                  <div className="h-3 w-full bg-ink/5 border border-hairline rounded-xs overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        item.status === "completed"
                          ? "bg-ink"
                          : item.status === "current"
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-transparent"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown (1 Column) */}
        <div className="p-6 border border-hairline rounded-sm bg-paper">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-ink tracking-tight">
                Points by Category
              </h3>
              <p className="text-xs text-muted font-mono mt-0.5">
                Distribution across 5 disciplines
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {standing.categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink font-medium">{cat.category}</span>
                  <span className="text-muted font-bold">
                    {cat.points} pts ({cat.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-ink/5 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-ink/80 rounded-xs"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-hairline text-[11px] text-muted font-mono leading-relaxed">
            Data aggregated locally via Prisma 7 telemetry & verified upstream in central Supabase.
          </div>
        </div>
      </div>
    </div>
  );
}
