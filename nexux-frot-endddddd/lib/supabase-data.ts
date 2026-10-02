/**
 * supabase-data.ts
 *
 * Fetches real data from the Supabase database (profiles, submissions, activity_catalog)
 * and maps it into the MemberProfile, TeamStanding, and AchievementSubmission shapes
 * that the existing dashboard components expect.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  HARDCODED ITEMS  (not in the database — add these tables/columns later)  │
 * │                                                                          │
 * │  1. MemberProfile.isLeader        — no `is_leader` column in `profiles`  │
 * │  2. MemberProfile.specialization  — no `specialization` col in profiles  │
 * │  3. MemberProfile.bio             — no `bio` column in `profiles`        │
 * │  4. MemberProfile.githubUsername   — no `github_username` in profiles     │
 * │  5. MemberProfile.streakDays      — no streak tracking in the DB         │
 * │  6. MemberProfile.recentLogs      — no activity/audit log table          │
 * │  7. MemberProfile.githubContributions — no GitHub integration yet        │
 * │  8. TeamStanding.rank             — no cross-team rankings table         │
 * │  9. TeamStanding.totalTeams       — no teams leaderboard                 │
 * │ 10. TeamStanding.gapToFirst       — no inter-team comparison             │
 * │ 11. TeamStanding.weeklyGrowth     — no weekly delta tracking             │
 * │ 12. TeamStanding.weeklyProgression — no week-by-week milestone table     │
 * │ 13. TeamStanding.categoryBreakdown — computed from submissions on-the-fly│
 * │ 14. CANONICAL_ACTIVITIES          — uses CENTRAL_ACTIVITIES from DB      │
 * └────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from "./supabase";
import type { MemberProfile } from "./members-data";
import { TeamStanding, AchievementSubmission, CANONICAL_ACTIVITIES } from "./competition-data";

// ─────────────────────────────────────────────────
// Types for Supabase joined relations
// ─────────────────────────────────────────────────
interface ActivityCatalogRow {
  id: string;
  code: string;
  label: string;
  level: string | null;
  points: number;
  category: string;
}

interface ProfileRow {
  full_name: string | null;
  department: string | null;
}

// ─────────────────────────────────────────────────
// The canonical team ID for "Nexus"
// ─────────────────────────────────────────────────
const TEAM_ID = "54a0575b-8f20-4882-9d4f-391c94ffd560";

// ─────────────────────────────────────────────────
// HARDCODED: Leader IDs — until `is_leader` column exists
// Map profile IDs you know are leaders. Empty = treat none as leaders.
// You can populate this once you know which profile UUIDs are leads.
// ─────────────────────────────────────────────────
const LEADER_IDS: Set<string> = new Set([
  // Add actual profile UUIDs of leaders here, e.g.:
  // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
]);

// ─────────────────────────────────────────────────
// HARDCODED defaults for fields not in the database
// ─────────────────────────────────────────────────
const DEFAULT_SPECIALIZATION = "Sprint Engineering";
const DEFAULT_BIO = "Active member of the Nexus engineering cohort, contributing to the AARVAK sprint.";
const DEFAULT_GITHUB_USERNAME = "nexus-member";
const DEFAULT_RECENT_LOGS: MemberProfile["recentLogs"] = [];
const DEFAULT_GITHUB_CONTRIBUTIONS: MemberProfile["githubContributions"] = {
  totalThisMonth: 0,
  activeDays: 0,
  recentRepo: "nexus/sprint",
  heatmap: Array(28).fill(0),
};

// ─────────────────────────────────────────────────
// Department mapping: DB values → frontend union type
// ─────────────────────────────────────────────────
function mapDepartment(
  dbDepartment: string | null
): MemberProfile["department"] {
  const mapping: Record<string, MemberProfile["department"]> = {
    Technical: "Technical",
    PR: "PR",
    Design: "Design",
    "Event Mgt": "Event Mgt",
    Social: "Social",
    "R&D": "R&D",
    // Common aliases
    technical: "Technical",
    pr: "PR",
    design: "Design",
    social: "Social",
    "event mgt": "Event Mgt",
    "r&d": "R&D",
    rd: "R&D",
    "event management": "Event Mgt",
  };
  return mapping[dbDepartment ?? ""] ?? "Technical";
}

// ─────────────────────────────────────────────────
// Map a sprint_track value into a human-readable role
// ─────────────────────────────────────────────────
function mapRole(sprintTrack: string | null, department: string | null): string {
  if (sprintTrack === "code") return "Full-Stack Engineer";
  if (sprintTrack === "open_source") return "Open Source Contributor";
  if (sprintTrack === "build") return "Builder & Architect";
  if (sprintTrack === "pitch") return "Pitch & Strategy Lead";
  // Fallback based on department
  return `${department ?? "Team"} Member`;
}

// ─────────────────────────────────────────────────
// Fetch Members from `profiles` + `submissions`
// ─────────────────────────────────────────────────
export async function fetchMembers(): Promise<MemberProfile[]> {
  // 1. Fetch all profiles for our team
  const { data: profiles, error: profError } = await supabase
    .from("profiles")
    .select("*")
    .eq("team_id", TEAM_ID)
    .eq("is_active", true);

  if (profError) {
    console.error("Failed to fetch profiles:", profError.message);
    return [];
  }

  // 2. Fetch all submissions for our team, joined with activity_catalog
  const { data: submissions, error: subError } = await supabase
    .from("submissions")
    .select(
      "*, activity_catalog(id, code, label, level, points, category)"
    )
    .eq("team_id", TEAM_ID)
    .order("submitted_at", { ascending: false });

  if (subError) {
    console.error("Failed to fetch submissions:", subError.message);
    return [];
  }

  // 3. Build a map of member_id → ALL their submissions
  const subs = submissions ?? [];
  type SubmissionRow = (typeof subs)[number];
  const subsByMember = new Map<string, SubmissionRow[]>();
  for (const sub of subs) {
    const existing = subsByMember.get(sub.member_id) ?? [];
    existing.push(sub);
    subsByMember.set(sub.member_id, existing);
  }

  // Helper: resolve points for a submission — awarded_points takes priority,
  // then catalog points, then canonical fallback. We skip net_points when it
  // is 0 because the DB defaults to 0 before review.
  function resolvePoints(s: SubmissionRow): number {
    const catalog = s.activity_catalog as ActivityCatalogRow | null;
    if (s.awarded_points != null && s.awarded_points > 0) return s.awarded_points;
    if (catalog?.points != null && catalog.points > 0) return catalog.points;
    if (s.net_points != null && s.net_points > 0) return s.net_points;
    // Fallback: try matching canonical activities by catalog label
    const label = catalog?.label || s.title || "";
    return CANONICAL_ACTIVITIES.find(a => a.title === label)?.points ?? 0;
  }

  // Helper: build a display title from the activity catalog (label + level)
  function resolveTitle(s: SubmissionRow): string {
    const catalog = s.activity_catalog as ActivityCatalogRow | null;
    if (catalog?.label) {
      return catalog.level ? `${catalog.label} — ${catalog.level}` : catalog.label;
    }
    // Fallback: use submission details (strip "Nexus: username" prefix titles)
    if (s.details && s.details.length > 0) return s.details;
    return s.title || "Achievement";
  }

  // 4. Map profiles into MemberProfile[]
  const members: MemberProfile[] = (profiles ?? []).map((prof) => {
    const memberSubs = subsByMember.get(prof.id) ?? [];
    // Include ALL non-rejected submissions (pending, verified, done)
    const countedSubs = memberSubs.filter(
      (s) => {
        const stat = (s.status || "").toLowerCase();
        return stat !== "rejected" && stat !== "revoked";
      }
    );

    // Calculate total points from all counted submissions
    const totalPoints = countedSubs.reduce((sum, s) => sum + resolvePoints(s), 0);

    // Build achievements from all counted submissions
    const achievements: MemberProfile["achievements"] = countedSubs.map(
      (s) => {
        const catalog = s.activity_catalog as ActivityCatalogRow | null;
        return {
          id: s.id,
          title: resolveTitle(s),
          date: s.occurred_on
            ? new Date(s.occurred_on).toISOString().split("T")[0]
            : new Date(s.submitted_at).toISOString().split("T")[0],
          points: resolvePoints(s),
          category:
            catalog?.category ?? "General",
        };
      }
    );

      // Compute streak days
      const dateCounts: Record<string, number> = {};
      achievements.forEach((ach) => {
        dateCounts[ach.date] = (dateCounts[ach.date] || 0) + 1;
      });
      let currentStreak = 0;
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const tempDate = new Date(today);
      let checkStr = tempDate.toISOString().split("T")[0];

      if (dateCounts[checkStr] && dateCounts[checkStr] > 0) {
        currentStreak++;
        while (true) {
          tempDate.setDate(tempDate.getDate() - 1);
          checkStr = tempDate.toISOString().split("T")[0];
          if (dateCounts[checkStr] && dateCounts[checkStr] > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        tempDate.setDate(tempDate.getDate() - 1);
        checkStr = tempDate.toISOString().split("T")[0];
        if (dateCounts[checkStr] && dateCounts[checkStr] > 0) {
          currentStreak++;
          while (true) {
            tempDate.setDate(tempDate.getDate() - 1);
            checkStr = tempDate.toISOString().split("T")[0];
            if (dateCounts[checkStr] && dateCounts[checkStr] > 0) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

    const isLeader = LEADER_IDS.has(prof.id);

    return {
      id: prof.id,
      name: prof.full_name ?? "Unknown",
      role: isLeader
        ? "Team Lead & Advisor"
        : mapRole(prof.sprint_track, prof.department),
      isLeader,
      department: mapDepartment(prof.department),
      // ── HARDCODED fields ──
      specialization: DEFAULT_SPECIALIZATION,
      bio: DEFAULT_BIO,
      githubUsername: DEFAULT_GITHUB_USERNAME,
      streakDays: currentStreak,
      recentLogs: DEFAULT_RECENT_LOGS,
      githubContributions: DEFAULT_GITHUB_CONTRIBUTIONS,
      // ── FROM DB ──
      avatarUrl:
        prof.avatar_path ??
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
          prof.full_name ?? "member"
        )}`,
      points: isLeader ? undefined : totalPoints,
      rank: undefined, // will be assigned after sorting
      completedTasks: isLeader ? undefined : countedSubs.length,
      totalSubmissions: isLeader ? undefined : memberSubs.length,
      achievements,
    };
  });

  // 5. Sort non-leaders by points descending and assign ranks
  const leaders = members.filter((m) => m.isLeader);
  const contributors = members
    .filter((m) => !m.isLeader)
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  contributors.forEach((m, i) => {
    m.rank = i + 1;
  });

  // Leaders first, then ranked contributors
  return [...leaders, ...contributors];
}

// ─────────────────────────────────────────────────
// Fetch Submissions for the Activity Feed & Verify panel
// ─────────────────────────────────────────────────
export async function fetchSubmissions(): Promise<AchievementSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "*, profiles!member_id(full_name, department), activity_catalog(label, level, points, category)"
    )
    .eq("team_id", TEAM_ID)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch submissions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const profile = row.profiles as ProfileRow | null;
    const activity = row.activity_catalog as ActivityCatalogRow | null;

    // Map DB status to frontend status union
    let status: "DONE" | "VERIFIED" | "REJECTED";
    switch (row.status) {
      case "verified":
        status = "VERIFIED";
        break;
      case "rejected":
      case "revoked":
        status = "REJECTED";
        break;
      default:
        // "pending", "needs_info", or anything else → DONE (awaiting review)
        status = "DONE";
    }

    const activityTitle = activity?.label
      ? (activity.level ? `${activity.label} — ${activity.level}` : activity.label)
      : row.title ?? "Achievement";

    // Resolve points: awarded_points > catalog.points > net_points > canonical fallback
    let points = 0;
    if (row.awarded_points != null && row.awarded_points > 0) {
      points = row.awarded_points;
    } else if (activity?.points != null && activity.points > 0) {
      points = activity.points;
    } else if (row.net_points != null && row.net_points > 0) {
      points = row.net_points;
    }

    return {
      id: row.id,
      memberName: profile?.full_name ?? "Unknown",
      department: profile?.department ?? "Unknown",
      team: "Nexus",
      achievedOn: row.occurred_on
        ? new Date(row.occurred_on).toISOString().split("T")[0]
        : "",
      details: row.details ?? row.title ?? "",
      proofUrl: row.external_url ?? "/logo/official_jewel.png",
      status,
      activityTitle,
      points,
      submittedAt: formatRelativeTime(row.submitted_at),
      reviewedBy: row.decided_by ?? undefined,
      reviewedAt: row.decided_at
        ? formatRelativeTime(row.decided_at)
        : undefined,
      rejectionReason: row.decision_note ?? undefined,
    };
  });
}

// ─────────────────────────────────────────────────
// Fetch the Activity Catalog (replaces CANONICAL_ACTIVITIES)
// ─────────────────────────────────────────────────
export async function fetchActivityCatalog() {
  const { data, error } = await supabase
    .from("activity_catalog")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch activity catalog:", error.message);
    return [];
  }

  return (data ?? []).map((act) => ({
    id: act.id,
    title: act.label + (act.level ? ` — ${act.level}` : ""),
    category: act.category ?? "Individual",
    points: act.points ?? 0,
  }));
}

// ─────────────────────────────────────────────────
// Build TeamStanding from live data
//
// HARDCODED: rank, totalTeams, gapToFirst, weeklyGrowth, weeklyProgression
// COMPUTED: totalScore, topContributor, categoryBreakdown
// ─────────────────────────────────────────────────
export async function fetchTeamStanding(
  members: MemberProfile[]
): Promise<TeamStanding> {
  const contributors = members.filter((m) => !m.isLeader && m.points);

  // Total score = sum of all member points
  const totalScore = contributors.reduce(
    (sum, m) => sum + (m.points ?? 0),
    0
  );

  // Top contributor
  const topMember = contributors[0]; // already sorted by points desc

  // Category breakdown from member achievements
  const catMap = new Map<string, number>();
  for (const m of members) {
    for (const ach of m.achievements) {
      const cat = ach.category ?? "General";
      catMap.set(cat, (catMap.get(cat) ?? 0) + ach.points);
    }
  }
  const totalCatPoints = Array.from(catMap.values()).reduce(
    (a, b) => a + b,
    0
  );
  const categoryBreakdown = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, points]) => ({
      category,
      points,
      percentage:
        totalCatPoints > 0 ? Math.round((points / totalCatPoints) * 100) : 0,
    }));

  return {
    // ── HARDCODED (not in DB — add a teams / leaderboard table later) ──
    rank: 1,
    totalTeams: 14,
    gapToFirst: 0,
    weeklyGrowth: 0,
    weeklyProgression: [
      {
        week: "Week 1",
        title: "Identity, 3D Jewel & Foundation Dashboard",
        points: 0,
        target: 800,
        status: "completed" as const,
      },
      {
        week: "Week 2",
        title: "Open Source Contributions & Upstream Sync",
        points: 0,
        target: 1000,
        status: "current" as const,
      },
      {
        week: "Week 3",
        title: "Autonomous Agents & High-Throughput Ingestion",
        points: 0,
        target: 1200,
        status: "upcoming" as const,
      },
      {
        week: "Week 4",
        title: "Grand Tech Showcase & Final Evaluation",
        points: 0,
        target: 1500,
        status: "upcoming" as const,
      },
    ],
    // ── FROM DB ──
    totalScore,
    topContributor: {
      name: topMember?.name ?? "—",
      points: topMember?.points ?? 0,
      avatarUrl: topMember?.avatarUrl ?? "/avatars/avatar_1.png",
    },
    categoryBreakdown:
      categoryBreakdown.length > 0
        ? categoryBreakdown
        : [{ category: "General", points: totalScore, percentage: 100 }],
  };
}

// ─────────────────────────────────────────────────
// Utility: relative time formatting
// ─────────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
