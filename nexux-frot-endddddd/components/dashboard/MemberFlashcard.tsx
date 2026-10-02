"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MemberProfile } from "@/lib/members-data";
import { ExternalLink, Flame, ArrowRight } from "lucide-react";

interface MemberFlashcardProps {
  member: MemberProfile;
  onSelect?: (member: MemberProfile) => void;
}

export function MemberFlashcard({ member }: MemberFlashcardProps) {
  return (
    <Link
      href={`/dashboard/members/${member.id}`}
      className={`group relative flex flex-col justify-between p-5 rounded-sm border transition-all duration-300 cursor-pointer ${
        member.isLeader
          ? "border-ink/40 bg-paper/90 hover:border-ink hover:shadow-[0_0_24px_rgba(var(--ink-rgb),0.1)] hover:-translate-y-1"
          : "border-hairline bg-paper hover:border-ink/50 hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      {/* Top Header: Badge & Status */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {member.isLeader ? (
          <span className="hv-kicker text-[10px] px-2.5 py-0.5 rounded-full border border-ink/40 bg-ink/5 text-ink font-bold">
            LEADER / GUIDE
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-ink/80">
              #{member.rank}
            </span>
            <span className="hv-kicker text-[10px] text-muted">
              {member.department}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{member.streakDays}d</span>
        </div>
      </div>

      {/* Centerpiece: Clean Robot Avatar (NO ASCII layer on flashcard as requested) */}
      <div className="relative mx-auto my-2 w-36 h-36 border border-hairline rounded-sm overflow-hidden bg-[#07090e] group-hover:border-ink/40 transition-colors">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={144}
          height={144}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        {/* Subtle view dossier hover pill */}
        <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
          <span className="px-2 py-0.5 rounded bg-ink text-onink font-mono text-[9px] font-bold tracking-wider flex items-center gap-1">
            <span>OPEN DOSSIER</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* Bottom Info: Name, Specialization, Score/Role */}
      <div className="mt-4 pt-3 border-t border-hairline">
        <h3 className="font-bold text-base text-ink tracking-tight flex items-center justify-between">
          <span>{member.name}</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-xs text-muted font-mono mt-0.5 line-clamp-1">
          {member.specialization}
        </p>

        {/* Contributor Score vs Leader Designation */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono">
          {member.isLeader ? (
            <span className="text-[11px] text-ink/80 italic">
              Non-scored Mentor
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">
                {member.points} PTS
              </span>
              <span className="text-[11px] text-muted">
                ({member.completedTasks} tasks)
              </span>
            </div>
          )}
          <span className="text-[10px] text-muted group-hover:text-ink font-bold transition-colors flex items-center gap-0.5">
            <span>VIEW FULL</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
