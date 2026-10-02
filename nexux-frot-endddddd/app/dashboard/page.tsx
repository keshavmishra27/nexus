"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { TEAM_MEMBERS, MemberProfile } from "@/lib/members-data";
import {
  INITIAL_STANDING,
  INITIAL_SUBMISSIONS,
  TeamStanding,
  AchievementSubmission,
} from "@/lib/competition-data";
import {
  fetchMembers,
  fetchSubmissions,
  fetchTeamStanding,
  fetchActivityCatalog,
} from "@/lib/supabase-data";
import { MemberFlashcard } from "@/components/dashboard/MemberFlashcard";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { SubmitAchievement } from "@/components/dashboard/SubmitAchievement";
import { VerifyAchievements } from "@/components/dashboard/VerifyAchievements";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { SystemBlueprint } from "@/components/dashboard/SystemBlueprint";
import {
  Trophy,
  Users,
  Send,
  ShieldCheck,
  Activity,
  Cpu,
  Moon,
  Sun,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";

type UserRole = "CORE" | "MEMBER";

const DEFAULT_USER = {
  name: "Arjun Mehta",
  email: "arjun@nexus.org",
  role: "CORE" as UserRole,
  department: "Technical",
  avatarUrl: "/avatars/avatar_1.png",
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Session state — initialized with defaults for SSR hydration
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [isMounted, setIsMounted] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus-session");
      if (stored) {
        const parsed = JSON.parse(stored);
        // We use setTimeout to avoid 'react-hooks/set-state-in-effect' (synchronous setState)
        setTimeout(() => {
          setCurrentUser({
            ...DEFAULT_USER,
            name: parsed.name || DEFAULT_USER.name,
            email: parsed.email || DEFAULT_USER.email,
            role: parsed.role || DEFAULT_USER.role,
          });
        }, 0);
      }
    } catch {}
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // Active section: 1 to 6
  const [activeSection, setActiveSection] = useState<number>(1);

  // App data state — initialize with mock data as fallbacks
  const [standing, setStanding] = useState<TeamStanding>(INITIAL_STANDING);
  const [members, setMembers] = useState<MemberProfile[]>(TEAM_MEMBERS);
  const [submissions, setSubmissions] = useState<AchievementSubmission[]>(INITIAL_SUBMISSIONS);
  const [activities, setActivities] = useState<{ id: string; title: string; category: string; points: number }[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [fetchedMembers, fetchedSubmissions, fetchedActivities] =
          await Promise.all([
            fetchMembers(),
            fetchSubmissions(),
            fetchActivityCatalog(),
          ]);

          setMembers(fetchedMembers);

          // Build team standing from real member data
          const realStanding = await fetchTeamStanding(fetchedMembers);
          setStanding(realStanding);

        setSubmissions(fetchedSubmissions);
        setActivities(fetchedActivities);
      } catch (err) {
        console.error("Failed to fetch Supabase data, using fallback mock data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);



  const handleSignOut = () => {
    try {
      localStorage.removeItem("nexus-session");
    } catch {}
    router.push("/login");
  };

  // Switch role for quick live testing
  const toggleRole = () => {
    const newRole = currentUser.role === "CORE" ? "MEMBER" : "CORE";
    setCurrentUser((prev) => ({ ...prev, role: newRole }));
    if (newRole === "MEMBER" && activeSection === 4) {
      setActiveSection(1); // Redirect away from core-only section
    }
  };

  // Submit achievement callback
  const handleSubmitSuccess = (newSub: AchievementSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  // Approve achievement callback
  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          // Update standing score
          setStanding((s) => ({
            ...s,
            totalScore: s.totalScore + sub.points,
            weeklyGrowth: Number((s.weeklyGrowth + 1.2).toFixed(1)),
          }));

          // Update member points
          setMembers((mList) =>
            mList.map((m) => {
              if (m.name.toLowerCase().includes(sub.memberName.toLowerCase())) {
                return {
                  ...m,
                  points: (m.points || 0) + sub.points,
                  completedTasks: (m.completedTasks || 0) + 1,
                  achievements: [
                    {
                      id: `ach-${Date.now()}`,
                      title: sub.activityTitle,
                      date: sub.achievedOn,
                      points: sub.points,
                      category: sub.department,
                    },
                    ...m.achievements,
                  ],
                };
              }
              return m;
            })
          );

          return {
            ...sub,
            status: "VERIFIED" as const,
            reviewedBy: currentUser.name,
            reviewedAt: "Just now",
          };
        }
        return sub;
      })
    );
  };

  // Reject achievement callback
  const handleReject = (id: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: "REJECTED" as const,
            rejectionReason: reason,
            reviewedBy: currentUser.name,
            reviewedAt: "Just now",
          };
        }
        return sub;
      })
    );
  };

  const navItems = [
    { id: 1, label: "Team Performance", icon: Trophy },
    { id: 2, label: "Team Members", icon: Users },
    { id: 3, label: "Submit Achievement", icon: Send },
    ...(currentUser.role === "CORE"
      ? [{ id: 4, label: "Verify Achievements", icon: ShieldCheck, coreOnly: true }]
      : []),
    { id: 5, label: "Activity & Audit Feed", icon: Activity },
    { id: 6, label: "Nexus System Blueprint", icon: Cpu },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-400">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-paper/85 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-mono text-sm font-bold tracking-caps-lg text-ink">
              NEXUS
            </span>
            <span className="hv-kicker text-[10px] text-muted">
              DASHBOARD // SPRINT #2
            </span>
          </Link>
        </div>

        {/* User Session & Role Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick Role Switcher for Pairing & Review Testing */}
          <button
            onClick={toggleRole}
            title="Click to toggle between Core and Member view"
            className="flex items-center gap-2 px-2.5 py-1 border border-hairline rounded text-[11px] font-mono hover:border-ink transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline text-muted">ROLE:</span>
            <span className={`font-bold ${currentUser.role === "CORE" ? "text-amber-500" : "text-ink"}`}>
              {currentUser.role}
            </span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm border border-hairline overflow-hidden bg-black relative shrink-0">
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block text-left font-mono">
              <p className="text-xs font-bold text-ink leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-muted">{currentUser.department}</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-2 border border-hairline rounded-full hover:border-ink transition-colors"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="p-2 border border-hairline rounded-sm hover:border-red-500/60 hover:text-red-500 transition-colors text-muted"
            title="Sign out of Nexus session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Persistent 6-Section Tab Bar */}
      <div className="sticky top-[65px] z-30 w-full border-b border-hairline bg-paper/90 backdrop-blur-md px-6 sm:px-10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono transition-all ${
                  isActive
                    ? "bg-ink text-onink font-bold shadow-sm"
                    : "text-muted hover:text-ink hover:bg-ink/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.coreOnly && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">
                    CORE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Section Content Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-4 mb-6 border border-hairline rounded-sm bg-paper">
            <Loader2 className="w-4 h-4 animate-spin text-muted" />
            <span className="text-xs font-mono text-muted">
              SYNCHRONIZING WITH SUPABASE...
            </span>
          </div>
        )}

        {/* Section 1: Team Performance */}
        {activeSection === 1 && <TeamPerformance standing={standing} members={members} currentUser={currentUser} />}

        {/* Section 2: Team Members (10 Flashcards with ASCII Dissolve) */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-hairline gap-2">
              <div>
                <h2 className="text-xl font-bold text-ink tracking-tight">
                  Team Members & Engineering Cohort
                </h2>
                <p className="text-xs font-mono text-muted mt-0.5">
                  {members.length} active members: {members.filter(m => m.isLeader).length} Guides / Leaders + {members.filter(m => !m.isLeader).length} Contributing Engineers • Click any card to open full dossier
                </p>
              </div>
              <span className="hv-kicker text-[10px] px-2.5 py-1 rounded border border-hairline">
                {members.filter(m => !m.isLeader).length} CONTRIBUTING • {members.filter(m => m.isLeader).length} GUIDES
              </span>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {members.map((member) => (
                <MemberFlashcard
                  key={member.id}
                  member={member}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Submit Achievement */}
        {activeSection === 3 && (
          <SubmitAchievement
            currentUser={currentUser}
            onSubmitSuccess={handleSubmitSuccess}
            activities={activities.length > 0 ? activities : undefined}
          />
        )}

        {/* Section 4: Verify Achievements (Core Only) */}
        {activeSection === 4 && currentUser.role === "CORE" && (
          <VerifyAchievements
            submissions={submissions}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {/* Section 5: Activity & Audit Feed */}
        {activeSection === 5 && <LiveActivityFeed submissions={submissions} />}

        {/* Section 6: Nexus System Blueprint */}
        {activeSection === 6 && <SystemBlueprint />}
      </main>
    </div>
  );
}
