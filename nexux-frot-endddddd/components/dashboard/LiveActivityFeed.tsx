"use client";

import React from "react";
import { AchievementSubmission } from "@/lib/competition-data";
import { Terminal } from "lucide-react";

interface LiveActivityFeedProps {
  submissions: AchievementSubmission[];
}

export function LiveActivityFeed({ submissions }: LiveActivityFeedProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 border border-hairline rounded-sm bg-paper">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-ink" />
            <div>
              <h3 className="text-base font-bold text-ink tracking-tight">
                Live Audit & Telemetry Feed
              </h3>
              <p className="text-xs text-muted font-mono mt-0.5">
                Cryptographically tracked sprint ledger • Deterministic state updates
              </p>
            </div>
          </div>
          <span className="hv-kicker text-[10px] px-2.5 py-1 rounded-full border border-hairline bg-ink/5">
            STREAMING ACTIVE
          </span>
        </div>

        {/* Feed Timeline */}
        <div className="relative border-l border-hairline pl-6 ml-3 space-y-6">
          {submissions.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-paper transition-transform group-hover:scale-125 ${
                  item.status === "VERIFIED"
                    ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                    : item.status === "DONE"
                    ? "bg-amber-500 ring-2 ring-amber-500/20 animate-pulse"
                    : "bg-red-500 ring-2 ring-red-500/20"
                }`}
              />

              <div className="p-4 border border-hairline rounded-sm bg-paper hover:border-ink/30 transition-all space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{item.memberName}</span>
                    <span className="text-muted">[{item.department}]</span>
                  </div>
                  <span className="text-muted">{item.submittedAt}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-ink">{item.activityTitle}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      item.status === "VERIFIED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : item.status === "DONE"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.status === "VERIFIED" ? `+${item.points} PTS` : item.status}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed font-sans">
                  {item.details}
                </p>

                {item.reviewedBy && (
                  <div className="pt-2 border-t border-hairline text-[10px] font-mono text-muted flex items-center justify-between">
                    <span>
                      Audited by: <span className="text-ink font-medium">{item.reviewedBy}</span>
                    </span>
                    <span>{item.reviewedAt}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
