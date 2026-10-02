"use client";

import React, { useState, useMemo } from "react";
import { Github, Flame } from "lucide-react";
import { MemberProfile } from "@/lib/members-data";

interface GitHubContributionCalendarProps {
  member: MemberProfile;
  className?: string;
}

interface DayData {
  date: string;
  count: number;
  level: number; // 0 to 4
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  weekIndex: number;
  monthName: string;
  isFirstDayOfMonth: boolean;
}

export function GitHubContributionCalendar({
  member,
  className = "",
}: GitHubContributionCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [themeMode, setThemeMode] = useState<"emerald" | "mono">("emerald");

  // Generate dynamic daily contribution data based on the user's earliest achievement
  const { weeks, monthLabels, totalContributions, maxStreak, currentStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const firstContributionDate = (member.achievements && member.achievements.length > 0)
      ? new Date(Math.min(...member.achievements.map(a => new Date(a.date).getTime())))
      : today;
      
    // Calculate total days between first contribution and today
    const msPerDay = 1000 * 60 * 60 * 24;
    let requiredDays = Math.floor((today.getTime() - firstContributionDate.getTime()) / msPerDay) + 1;
    
    // Enforce a minimum of 32 weeks (about 8 months) for a full-looking grid if they are new
    if (requiredDays < 32 * 7) requiredDays = 32 * 7;
    
    const numWeeks = Math.ceil(requiredDays / 7);
    const totalDays = numWeeks * 7;

    // Calculate daily contribution counts from member achievements
    const dateCounts: Record<string, number> = {};
    if (member.achievements) {
      member.achievements.forEach((ach) => {
        const dateKey = ach.date; // assuming YYYY-MM-DD
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      });
    }

    const days: DayData[] = [];
    let runningTotal = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let curStreak = 0;

    // Start date: totalDays ago, aligned to Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (6 - today.getDay()));

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthTracker: { name: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dayOfWeek = d.getDay();
      const weekIdx = Math.floor(i / 7);
      const mIdx = d.getMonth();

      // Track first week a month appears
      if (mIdx !== lastMonth) {
        monthTracker.push({ name: monthNames[mIdx], weekIdx });
        lastMonth = mIdx;
      }

      const dateStr = d.toISOString().split("T")[0];
      const count = dateCounts[dateStr] || 0;
      
      let level = 0;
      if (count >= 4) level = 4;
      else if (count === 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;

      runningTotal += count;

      if (count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      // Current streak at end (check if recent days have streak)
      if (i === totalDays - 2) { // Yesterday
        curStreak = tempStreak;
      } else if (i === totalDays - 1) { // Today
        if (count > 0) curStreak = tempStreak;
      }

      days.push({
        date: dateStr,
        count,
        level,
        dayOfWeek,
        weekIndex: weekIdx,
        monthName: monthNames[mIdx],
        isFirstDayOfMonth: d.getDate() === 1,
      });
    }

    // Group into columns of 7 days
    const groupedWeeks: DayData[][] = [];
    for (let w = 0; w < numWeeks; w++) {
      groupedWeeks.push(days.slice(w * 7, (w + 1) * 7));
    }

    return {
      weeks: groupedWeeks,
      monthLabels: monthTracker,
      totalContributions: runningTotal,
      maxStreak: longestStreak,
      currentStreak: curStreak,
    };
  }, [member]);

  // Color mappings
  const getColorClass = (level: number) => {
    if (themeMode === "emerald") {
      switch (level) {
        case 1:
          return "bg-[#0e4429] dark:bg-[#0e4429] border-[#006d32]/40";
        case 2:
          return "bg-[#006d32] dark:bg-[#006d32] border-[#26a641]/50";
        case 3:
          return "bg-[#26a641] dark:bg-[#26a641] border-[#39d353]/60";
        case 4:
          return "bg-[#39d353] dark:bg-[#39d353] border-white/40 shadow-[0_0_8px_rgba(57,211,83,0.35)]";
        default:
          return "bg-[#161b22] dark:bg-[#161b22] border-white/5";
      }
    } else {
      // Monochromatic mode
      switch (level) {
        case 1:
          return "bg-[#27272a] border-[#3f3f46]";
        case 2:
          return "bg-[#52525b] border-[#71717a]";
        case 3:
          return "bg-[#a1a1aa] border-[#d4d4d8]";
        case 4:
          return "bg-[#ffffff] border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]";
        default:
          return "bg-[#121215] border-white/5";
      }
    }
  };

  return (
    <div className={`p-5 rounded-sm border border-hairline bg-paper/80 backdrop-blur-sm space-y-4 ${className}`}>
      {/* 1. Header: GitHub Handle, Stat Chips, and Theme Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-hairline gap-3">
        <div className="flex items-center gap-2.5">
          <Github className="w-5 h-5 text-ink" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-ink tracking-tight">
                GitHub Contribution Activity
              </h3>
              <a
                href={`https://github.com/${member.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted hover:text-ink hover:underline"
              >
                @{member.githubUsername} ↗
              </a>
            </div>
            <p className="text-[11px] font-mono text-muted">
              {totalContributions} contributions in the last 8 months • Active sprint sync
            </p>
          </div>
        </div>

        {/* Color Palette Toggle: GitHub Green vs Monochrome */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-muted hidden sm:inline">PALETTE:</span>
          <button
            onClick={() => setThemeMode("emerald")}
            className={`px-2 py-0.5 rounded border transition-colors ${
              themeMode === "emerald"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-hairline text-muted hover:text-ink"
            }`}
          >
            GITHUB GREEN
          </button>
          <button
            onClick={() => setThemeMode("mono")}
            className={`px-2 py-0.5 rounded border transition-colors ${
              themeMode === "mono"
                ? "border-ink bg-ink text-onink font-bold"
                : "border-hairline text-muted hover:text-ink"
            }`}
          >
            MONOCHROME
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-2.5 border border-hairline rounded bg-ink/[0.02]">
          <span className="text-[10px] text-muted block uppercase">TOTAL COMMITS</span>
          <span className="text-lg font-bold text-ink">{totalContributions}</span>
        </div>
        <div className="p-2.5 border border-hairline rounded bg-ink/[0.02]">
          <span className="text-[10px] text-muted block uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            CURRENT STREAK
          </span>
          <span className="text-lg font-bold text-amber-500">{currentStreak} Days</span>
        </div>
        <div className="p-2.5 border border-hairline rounded bg-ink/[0.02]">
          <span className="text-[10px] text-muted block uppercase">LONGEST STREAK</span>
          <span className="text-lg font-bold text-ink">{maxStreak} Days</span>
        </div>
        <div className="p-2.5 border border-hairline rounded bg-ink/[0.02]">
          <span className="text-[10px] text-muted block uppercase">ACTIVE REPOSITORY</span>
          <span className="text-xs font-bold text-ink truncate block mt-1" title={member.githubContributions.recentRepo}>
            {member.githubContributions.recentRepo.split("/")[1] || member.githubContributions.recentRepo}
          </span>
        </div>
      </div>

      {/* 3. The Authentic GitHub Calendar Grid */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Month Labels Axis */}
          <div className="flex text-[10px] font-mono text-muted mb-1 pl-7">
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                style={{ width: `${(100 / weeks.length) * 4}%` }}
                className="truncate"
              >
                {m.name}
              </div>
            ))}
          </div>

          {/* Calendar Body: Day Labels + Week Grid */}
          <div className="flex gap-1.5 items-start">
            {/* Day of Week Labels (GitHub style: Mon, Wed, Fri) */}
            <div className="flex flex-col gap-[3px] text-[9px] font-mono text-muted pt-[1px] w-6 shrink-0 select-none">
              <span className="h-[10px] leading-[10px] invisible">Sun</span>
              <span className="h-[10px] leading-[10px]">Mon</span>
              <span className="h-[10px] leading-[10px] invisible">Tue</span>
              <span className="h-[10px] leading-[10px]">Wed</span>
              <span className="h-[10px] leading-[10px] invisible">Thu</span>
              <span className="h-[10px] leading-[10px]">Fri</span>
              <span className="h-[10px] leading-[10px] invisible">Sat</span>
            </div>

            {/* Week Columns */}
            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[10.5px] h-[10.5px] rounded-[2px] border transition-transform hover:scale-150 hover:z-20 cursor-pointer ${getColorClass(
                        day.level
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Hover Tooltip */}
        {hoveredDay && (
          <div className="mt-2 text-xs font-mono text-ink bg-ink/5 dark:bg-white/5 border border-hairline rounded px-3 py-1.5 inline-flex items-center gap-2">
            <span className="font-bold">
              {hoveredDay.count === 0
                ? "No contributions"
                : `${hoveredDay.count} contribution${hoveredDay.count > 1 ? "s" : ""}`}
            </span>
            <span className="text-muted">on {hoveredDay.date}</span>
          </div>
        )}
      </div>

      {/* 4. Legend & Footnote */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono text-muted pt-2 border-t border-hairline/60 gap-2">
        <div className="flex items-center gap-2">
          <span>Learn how we count contributions in the Nexus sprint audit pipeline</span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span>Less</span>
          <div className={`w-2.5 h-2.5 rounded-[2px] border ${getColorClass(0)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] border ${getColorClass(1)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] border ${getColorClass(2)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] border ${getColorClass(3)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] border ${getColorClass(4)}`} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
