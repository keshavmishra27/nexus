export interface MemberProfile {
  id: string;
  name: string;
  role: string;
  isLeader: boolean;
  department: "Technical" | "PR" | "Design" | "Event Mgt" | "Social" | "R&D";
  specialization: string;
  avatarUrl: string;
  githubUsername: string;
  bio: string;
  points?: number; // Only for contributing members
  rank?: number;
  completedTasks?: number;
  totalSubmissions?: number;
  streakDays: number;
  achievements: {
    id: string;
    title: string;
    date: string;
    points: number;
    category: string;
  }[];
  recentLogs: {
    date: string;
    message: string;
  }[];
  githubContributions: {
    totalThisMonth: number;
    activeDays: number;
    recentRepo: string;
    // 28-day activity matrix (values 0-4 for heatmap shading)
    heatmap: number[];
  };
}

export const TEAM_MEMBERS: MemberProfile[] = [
  // --- LEADER 1 ---
  {
    id: "lead-1",
    name: "Arjun Mehta",
    role: "Team Lead & Systems Architect",
    isLeader: true,
    department: "Technical",
    specialization: "Distributed Systems & Cloud Orchestration",
    avatarUrl: "/avatars/avatar_1.png",
    githubUsername: "arjun-nexus",
    bio: "Guiding the Nexus engineering cohort through the AARVAK sprint. Overseeing technical architecture, verification pipelines, and system scalability.",
    streakDays: 42,
    achievements: [
      { id: "ach-1", title: "Sprint 1 Architecture Sign-off", date: "2026-09-15", points: 100, category: "Milestone" },
      { id: "ach-2", title: "High-Throughput Ingestion Schema", date: "2026-09-18", points: 80, category: "Architecture" },
    ],
    recentLogs: [
      { date: "Today, 14:20", message: "Approved upstream schema verification for Week 2 tasks" },
      { date: "Yesterday", message: "Conducted architecture sync on distributed outbox model" },
    ],
    githubContributions: {
      totalThisMonth: 142,
      activeDays: 24,
      recentRepo: "nexus-core/orchestrator",
      heatmap: [1, 2, 4, 3, 2, 0, 1, 3, 4, 4, 2, 3, 1, 2, 4, 3, 4, 2, 1, 0, 3, 4, 3, 2, 4, 4, 3, 2],
    },
  },

  // --- LEADER 2 ---
  {
    id: "lead-2",
    name: "Dr. Elena Rostova",
    role: "R&D Guide & Technical Advisor",
    isLeader: true,
    department: "R&D",
    specialization: "Algorithmic Efficiency & Data Verification",
    avatarUrl: "/avatars/avatar_2.png",
    githubUsername: "erostova-lab",
    bio: "Faculty advisor and research mentor for Nexus. Advising on algorithmic optimization, deterministic telemetry, and rigorous audit standards.",
    streakDays: 38,
    achievements: [
      { id: "ach-3", title: "Audit Verification Framework", date: "2026-09-12", points: 90, category: "Research" },
      { id: "ach-4", title: "Mentorship Citation: AARVAK Sprint", date: "2026-09-17", points: 70, category: "Mentorship" },
    ],
    recentLogs: [
      { date: "Sep 21", message: "Reviewed telemetry math and weekly bucket aggregations" },
      { date: "Sep 19", message: "Validated cryptographic proof checksum pipeline" },
    ],
    githubContributions: {
      totalThisMonth: 98,
      activeDays: 20,
      recentRepo: "nexus-research/verification-specs",
      heatmap: [0, 1, 2, 3, 2, 1, 0, 2, 3, 2, 1, 3, 4, 2, 1, 2, 3, 2, 0, 1, 2, 3, 3, 2, 1, 2, 3, 2],
    },
  },

  // --- MEMBER 1 (TOP CONTRIBUTOR) ---
  {
    id: "mem-1",
    name: "Kaelen Voss",
    role: "Full-Stack Engineer",
    isLeader: false,
    department: "Technical",
    specialization: "Next.js Core & Three.js WebGL",
    avatarUrl: "/avatars/avatar_3.png",
    githubUsername: "kaelen-voss",
    bio: "Building immersive client runtimes and high-performance WebGL interfaces. Author of the Nexus 3D persistent logo engine.",
    points: 430,
    rank: 1,
    completedTasks: 18,
    totalSubmissions: 20,
    streakDays: 19,
    achievements: [
      { id: "ach-5", title: "Open Source PR Merged upstream", date: "2026-09-20", points: 60, category: "Open Source" },
      { id: "ach-6", title: "3D Procedural Hex Prism Implementation", date: "2026-09-19", points: 80, category: "Technical" },
      { id: "ach-7", title: "Weekly Challenge: Shader Performance", date: "2026-09-16", points: 50, category: "Challenge" },
      { id: "ach-8", title: "DSA Weekly Streak 14/14", date: "2026-09-14", points: 40, category: "Individual" },
    ],
    recentLogs: [
      { date: "2h ago", message: "Pushed smooth camera lerp across 3 landing sections" },
      { date: "Yesterday", message: "Integrated 4K canvas scale factor for retina displays" },
    ],
    githubContributions: {
      totalThisMonth: 184,
      activeDays: 26,
      recentRepo: "nexus-front/webgl-core",
      heatmap: [2, 3, 4, 4, 3, 2, 1, 4, 4, 3, 4, 2, 3, 4, 4, 3, 2, 4, 4, 3, 2, 4, 4, 4, 3, 2, 4, 3],
    },
  },

  // --- MEMBER 2 ---
  {
    id: "mem-2",
    name: "Mei-Ling Chen",
    role: "UI/UX & Design Systems Engineer",
    isLeader: false,
    department: "Design",
    specialization: "Monochrome Editorial & Pixel Art",
    avatarUrl: "/avatars/avatar_4.png",
    githubUsername: "meiling-design",
    bio: "Bridging the gap between strict Swiss brutalism and 8-bit vector precision. Designed the 29-sprite iconography ecosystem.",
    points: 385,
    rank: 2,
    completedTasks: 15,
    totalSubmissions: 16,
    streakDays: 14,
    achievements: [
      { id: "ach-9", title: "Havu Design System Token Spec", date: "2026-09-18", points: 70, category: "Design" },
      { id: "ach-10", title: "ASCII Dissolve Shader Algorithm", date: "2026-09-17", points: 80, category: "Innovation" },
      { id: "ach-11", title: "Major Project: Sprite Grid Engine", date: "2026-09-13", points: 90, category: "Design" },
    ],
    recentLogs: [
      { date: "4h ago", message: "Calibrated 1px hairline border alpha tokens for dark mode" },
      { date: "Sep 20", message: "Created 29 handcrafted vector SVG sprites with crispEdges" },
    ],
    githubContributions: {
      totalThisMonth: 136,
      activeDays: 22,
      recentRepo: "nexus-ui/tokens-engine",
      heatmap: [3, 2, 1, 4, 3, 0, 2, 3, 4, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 3, 4, 2, 3, 4, 3, 2, 1, 3],
    },
  },

  // --- MEMBER 3 ---
  {
    id: "mem-3",
    name: "Tariq Al-Mansoor",
    role: "Backend & Database Engineer",
    isLeader: false,
    department: "Technical",
    specialization: "PostgreSQL, Prisma 7 & Supabase RPC",
    avatarUrl: "/avatars/avatar_5.png",
    githubUsername: "tariq-mansoor",
    bio: "Hardening the two-tier local and central data stores. Author of the transactional outbox and dual-sync telemetry listeners.",
    points: 340,
    rank: 3,
    completedTasks: 13,
    totalSubmissions: 14,
    streakDays: 16,
    achievements: [
      { id: "ach-12", title: "PostgreSQL Driver Adapter Tuning", date: "2026-09-19", points: 65, category: "Backend" },
      { id: "ach-13", title: "Supabase RPC Security Definer Fix", date: "2026-09-16", points: 55, category: "Security" },
      { id: "ach-14", title: "Sprint Task: Ingestion Buffer Pipe", date: "2026-09-12", points: 50, category: "Backend" },
    ],
    recentLogs: [
      { date: "Yesterday", message: "Harmonized CUID and UUID mapping between local & central DB" },
      { date: "Sep 18", message: "Optimized multi-tenant indexing across department queries" },
    ],
    githubContributions: {
      totalThisMonth: 118,
      activeDays: 21,
      recentRepo: "nexus-backend/telemetry-rpc",
      heatmap: [1, 2, 3, 3, 2, 1, 0, 2, 3, 4, 3, 2, 1, 3, 2, 1, 3, 4, 2, 1, 2, 3, 4, 2, 3, 1, 2, 4],
    },
  },

  // --- MEMBER 4 ---
  {
    id: "mem-4",
    name: "Siddharth Rao",
    role: "Interactive Gameplay & Canvas Specialist",
    isLeader: false,
    department: "Technical",
    specialization: "HTML5 2D Canvas & Physics Simulation",
    avatarUrl: "/avatars/avatar_6.png",
    githubUsername: "sid-rao-dev",
    bio: "Creator of the 8-bit runner game embedded in the login gate. Specializes in 60fps frame loops, auto-jumping AI, and sprite collision.",
    points: 295,
    rank: 4,
    completedTasks: 11,
    totalSubmissions: 12,
    streakDays: 12,
    achievements: [
      { id: "ach-15", title: "8-Bit Crawler Physics Loop", date: "2026-09-20", points: 75, category: "Gameplay" },
      { id: "ach-16", title: "Stateful Crash & Sprint Transitions", date: "2026-09-18", points: 60, category: "Animation" },
      { id: "ach-17", title: "Hackathon Placement: 2nd Place", date: "2026-09-11", points: 40, category: "Bonus" },
    ],
    recentLogs: [
      { date: "6h ago", message: "Refined crawler death collision particle burst" },
      { date: "Sep 19", message: "Connected credentials submit status to runner game controller" },
    ],
    githubContributions: {
      totalThisMonth: 104,
      activeDays: 19,
      recentRepo: "nexus-game/runner-engine",
      heatmap: [0, 1, 2, 4, 3, 1, 2, 1, 3, 4, 2, 0, 1, 3, 4, 2, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 4, 2],
    },
  },

  // --- MEMBER 5 ---
  {
    id: "mem-5",
    name: "Chloe Dupont",
    role: "PR & Community Strategist",
    isLeader: false,
    department: "PR",
    specialization: "Technical Storytelling & Open Source Outreach",
    avatarUrl: "/avatars/avatar_7.png",
    githubUsername: "chloe-nexus-pr",
    bio: "Leading public relations, sprint documentation, and developer relations for Nexus. Driving open-source community engagement in Week 2.",
    points: 260,
    rank: 5,
    completedTasks: 10,
    totalSubmissions: 11,
    streakDays: 15,
    achievements: [
      { id: "ach-18", title: "AARVAK Sprint Tech Article Published", date: "2026-09-19", points: 50, category: "Publication" },
      { id: "ach-19", title: "Open Source PR Campaign Coordination", date: "2026-09-17", points: 45, category: "Outreach" },
      { id: "ach-20", title: "Tech Talk: Monochromatic Design", date: "2026-09-14", points: 40, category: "Talk" },
    ],
    recentLogs: [
      { date: "Yesterday", message: "Drafted Week 2 open-source contribution retrospective" },
      { date: "Sep 18", message: "Coordinated technical showcase with AARVAK leads" },
    ],
    githubContributions: {
      totalThisMonth: 82,
      activeDays: 17,
      recentRepo: "nexus-community/press-kit",
      heatmap: [1, 2, 1, 0, 2, 3, 2, 1, 2, 3, 1, 2, 0, 1, 3, 2, 1, 2, 3, 1, 0, 2, 3, 2, 1, 2, 3, 1],
    },
  },

  // --- MEMBER 6 ---
  {
    id: "mem-6",
    name: "Zubair Khan",
    role: "Algorithms & Competitive Coder",
    isLeader: false,
    department: "R&D",
    specialization: "Data Structures, LeetCode & Performance Profiling",
    avatarUrl: "/avatars/avatar_8.png",
    githubUsername: "zubair-algo",
    bio: "Focusing on low-level complexity optimizations and DSA challenges. Holding the longest active streak in the technical department.",
    points: 245,
    rank: 6,
    completedTasks: 9,
    totalSubmissions: 10,
    streakDays: 28,
    achievements: [
      { id: "ach-21", title: "DSA Monthly Streak 30/30", date: "2026-09-15", points: 80, category: "Individual" },
      { id: "ach-22", title: "Graph Traversal Telemetry Engine", date: "2026-09-13", points: 40, category: "R&D" },
    ],
    recentLogs: [
      { date: "3h ago", message: "Solved daily competitive problem with O(1) space complexity" },
      { date: "Sep 19", message: "Benchmarked client-side ASCII veil animation memory footprint" },
    ],
    githubContributions: {
      totalThisMonth: 95,
      activeDays: 25,
      recentRepo: "zubair-code/dsa-marathon",
      heatmap: [2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 3, 2, 3, 2, 3, 2, 3, 3, 2, 3, 2, 2, 3, 3, 2, 3, 2, 3],
    },
  },

  // --- MEMBER 7 ---
  {
    id: "mem-7",
    name: "Ananya Sharma",
    role: "Event Management & Sprint Coordinator",
    isLeader: false,
    department: "Event Mgt",
    specialization: "Sprint Hackathon Operations & Logistics",
    avatarUrl: "/avatars/avatar_9.png",
    githubUsername: "ananya-nexus",
    bio: "Managing sprint timelines, deliverables checkpoints, and intra-team hackathon logistics. Keeping all 10 members in lockstep.",
    points: 210,
    rank: 7,
    completedTasks: 8,
    totalSubmissions: 9,
    streakDays: 11,
    achievements: [
      { id: "ach-23", title: "Sprint 1 Retrospective Session", date: "2026-09-16", points: 40, category: "Event" },
      { id: "ach-24", title: "Inter-Team Showcase Meetup", date: "2026-09-12", points: 35, category: "Event" },
    ],
    recentLogs: [
      { date: "Yesterday", message: "Scheduled Week 2 mid-sprint review checkpoint" },
      { date: "Sep 17", message: "Organized team asset repository and license checks" },
    ],
    githubContributions: {
      totalThisMonth: 64,
      activeDays: 15,
      recentRepo: "nexus-ops/sprint-schedules",
      heatmap: [0, 1, 2, 1, 0, 2, 3, 1, 0, 2, 1, 2, 1, 0, 2, 3, 1, 0, 2, 1, 2, 0, 1, 3, 2, 1, 0, 2],
    },
  },

  // --- MEMBER 8 ---
  {
    id: "mem-8",
    name: "Kenji Sato",
    role: "Social Media & Technical Evangelist",
    isLeader: false,
    department: "Social",
    specialization: "Digital Presence & Visual Artifacts",
    avatarUrl: "/avatars/avatar_10.png",
    githubUsername: "kenji-sato-ux",
    bio: "Broadcasting Nexus’s engineering breakthroughs, sprint rankings, and open-source contributions to the wider developer ecosystem.",
    points: 195,
    rank: 8,
    completedTasks: 7,
    totalSubmissions: 8,
    streakDays: 9,
    achievements: [
      { id: "ach-25", title: "Nexus Tech Sprint Launch Thread", date: "2026-09-18", points: 30, category: "Social" },
      { id: "ach-26", title: "Visual Showcase: CRT Dot Faces", date: "2026-09-14", points: 35, category: "Artifact" },
    ],
    recentLogs: [
      { date: "Yesterday", message: "Released teaser clip of 3D logo proximity tilt interaction" },
      { date: "Sep 16", message: "Compiled weekly sprint infographic highlighting #1 standing" },
    ],
    githubContributions: {
      totalThisMonth: 58,
      activeDays: 14,
      recentRepo: "nexus-social/broadcasts",
      heatmap: [1, 0, 2, 1, 1, 0, 2, 1, 0, 2, 1, 1, 0, 2, 1, 0, 2, 1, 1, 0, 2, 1, 0, 2, 1, 1, 0, 2],
    },
  },
];
