"use client";

import React, { useState } from "react";
import { Server, Database, Cloud, Shield } from "lucide-react";

export function SystemBlueprint() {
  const [selectedNode, setSelectedNode] = useState<string>("rpc");

  const nodes = {
    localDb: {
      title: "Local Team Tier (PostgreSQL + Prisma 7.10)",
      badge: "High-Frequency Ingestion",
      desc: "Handles member submissions, local DONE states, audit logs, and weekly bucket telemetry with zero central latency. Uses @prisma/adapter-pg for serverless connection pooling.",
      details: [
        "Model: Achievement (id: cuid, status: AchievementStatus, proofUrl: String)",
        "Model: User (id: String, role: String, department: String)",
        "Indexes: [status], [team, status], [department, status]",
      ],
    },
    imagekit: {
      title: "Cloud Media Storage (ImageKit CDN)",
      badge: "Proof Storage & CDN",
      desc: "Ingests verifiable image buffers (PNG/JPG/WEBP, max 8MB) via Server Actions to /arrvak/proofs. Returns immutable CDN URLs and file IDs.",
      details: [
        "Upload endpoint: https://ik.imagekit.io/nexus-team/arrvak/proofs",
        "Verification: MIME type validation & memory buffer bounds check",
        "Immutable CDN caching with edge delivery",
      ],
    },
    rpc: {
      title: "Central Upstream Stored Procedure (Supabase RPC)",
      badge: "Authoritative Scoring",
      desc: "Invoked by Core reviewers when verifying an achievement. Writes the final authoritative score into central Supabase submissions table with SECURITY DEFINER privileges.",
      details: [
        "Procedure: submit_achievement(p_id, p_team_id, p_activity_id, p_title, ...)",
        "Auth: Validates caller has CORE role via user_roles table or CORE_MEMBER_EMAILS",
        "Sync state: Upstream status 'verified', local status updated to SYNCED",
      ],
    },
    exportApi: {
      title: "Central Export API (GET /api/export/verified)",
      badge: "Downstream Syndication",
      desc: "Secured by Bearer token (AARVAK_EXPORT_TOKEN). Allows competition organizers and upstream audit bots to stream all verified team achievements in JSON format.",
      details: [
        "Endpoint: GET /api/export/verified",
        "Headers: Authorization: Bearer <AARVAK_EXPORT_TOKEN>",
        "Output: Strict schema v1 containing CUIDs, member names, and CDN proof URLs",
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border border-hairline rounded-sm bg-paper">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
          <div>
            <h3 className="text-base font-bold text-ink tracking-tight">
              Nexus System Architecture Blueprint
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Interactive structural schematic • Hybrid two-tier specification
            </p>
          </div>
          <span className="hv-kicker text-[10px] px-2.5 py-1 rounded-full border border-hairline bg-ink/5">
            HAVU-INSPIRED BLUEPRINT
          </span>
        </div>

        {/* Interactive Schematic Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Node 1: Local DB */}
          <div
            onClick={() => setSelectedNode("localDb")}
            className={`p-4 border rounded-sm cursor-pointer transition-all ${
              selectedNode === "localDb"
                ? "border-ink bg-ink/5 shadow-sm"
                : "border-hairline bg-paper hover:border-ink/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] font-mono text-muted">TIER 1</span>
            </div>
            <h4 className="font-bold text-xs text-ink">Local PostgreSQL</h4>
            <p className="text-[11px] font-mono text-muted mt-1">
              Prisma 7.10 + Ingestion Store
            </p>
          </div>

          {/* Node 2: ImageKit */}
          <div
            onClick={() => setSelectedNode("imagekit")}
            className={`p-4 border rounded-sm cursor-pointer transition-all ${
              selectedNode === "imagekit"
                ? "border-ink bg-ink/5 shadow-sm"
                : "border-hairline bg-paper hover:border-ink/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Cloud className="w-5 h-5 text-purple-500" />
              <span className="text-[10px] font-mono text-muted">MEDIA</span>
            </div>
            <h4 className="font-bold text-xs text-ink">ImageKit CDN</h4>
            <p className="text-[11px] font-mono text-muted mt-1">
              Immutable Proof Storage
            </p>
          </div>

          {/* Node 3: Supabase RPC */}
          <div
            onClick={() => setSelectedNode("rpc")}
            className={`p-4 border rounded-sm cursor-pointer transition-all ${
              selectedNode === "rpc"
                ? "border-ink bg-ink/5 shadow-sm"
                : "border-hairline bg-paper hover:border-ink/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-mono text-muted">UPSTREAM</span>
            </div>
            <h4 className="font-bold text-xs text-ink">Supabase RPC</h4>
            <p className="text-[11px] font-mono text-muted mt-1">
              submit_achievement Proc
            </p>
          </div>

          {/* Node 4: Export API */}
          <div
            onClick={() => setSelectedNode("exportApi")}
            className={`p-4 border rounded-sm cursor-pointer transition-all ${
              selectedNode === "exportApi"
                ? "border-ink bg-ink/5 shadow-sm"
                : "border-hairline bg-paper hover:border-ink/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-mono text-muted">REST API</span>
            </div>
            <h4 className="font-bold text-xs text-ink">Export Gateway</h4>
            <p className="text-[11px] font-mono text-muted mt-1">
              GET /api/export/verified
            </p>
          </div>
        </div>

        {/* Active Node Detail Inspector */}
        {selectedNode && (
          <div className="p-6 border border-hairline rounded-sm bg-ink/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="hv-kicker text-[10px] text-blue-500">
                  {nodes[selectedNode as keyof typeof nodes].badge}
                </span>
                <h4 className="text-base font-bold text-ink mt-0.5">
                  {nodes[selectedNode as keyof typeof nodes].title}
                </h4>
              </div>
            </div>

            <p className="text-xs text-ink/80 leading-relaxed font-sans">
              {nodes[selectedNode as keyof typeof nodes].desc}
            </p>

            <div className="p-4 border border-hairline rounded bg-paper space-y-2 font-mono text-xs">
              <p className="font-bold text-ink text-[11px] uppercase tracking-wider">
                Technical Specifications:
              </p>
              {nodes[selectedNode as keyof typeof nodes].details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-muted">
                  <span className="text-emerald-500">▸</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
