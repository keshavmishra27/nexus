"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AchievementSubmission } from "@/lib/competition-data";
import { Check, X, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

interface VerifyAchievementsProps {
  submissions: AchievementSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function VerifyAchievements({
  submissions,
  onApprove,
  onReject,
}: VerifyAchievementsProps) {
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState<"DONE" | "ALL">("DONE");

  const doneSubmissions = submissions.filter((s) => s.status === "DONE");
  const displayList = activeTab === "DONE" ? doneSubmissions : submissions;

  const handleConfirmReject = () => {
    if (!rejectModalId || rejectionReason.trim().length < 8) return;
    onReject(rejectModalId, rejectionReason.trim());
    setRejectModalId(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Core Access Guarantee */}
      <div className="p-4 border border-hairline rounded-sm bg-paper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-hairline rounded bg-ink/5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Core Reviewer Verification Console</h3>
            <p className="text-xs font-mono text-muted">
              Restricted to Leaders & Core Reviewers • Synced via `submit_achievement` RPC
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 p-1 border border-hairline rounded bg-ink/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab("DONE")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "DONE" ? "bg-ink text-onink font-bold" : "text-muted hover:text-ink"
            }`}
          >
            DONE ({doneSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "ALL" ? "bg-ink text-onink font-bold" : "text-muted hover:text-ink"
            }`}
          >
            ALL LOGS ({submissions.length})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {displayList.length === 0 ? (
        <div className="p-12 text-center border border-hairline rounded-sm bg-paper space-y-2">
          <p className="text-sm font-bold text-ink">Zero DONE Verifications</p>
          <p className="text-xs font-mono text-muted">
            All team sprint submissions have been audited and scored upstream.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="p-5 border border-hairline rounded-sm bg-paper flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all hover:border-ink/40"
            >
              {/* Member & Details */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      item.status === "DONE"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : item.status === "VERIFIED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="font-bold text-sm text-ink">{item.memberName}</span>
                  <span className="text-xs text-muted font-mono">• {item.department}</span>
                  <span className="text-xs text-muted font-mono">• {item.submittedAt}</span>
                </div>

                <p className="text-xs font-semibold text-ink/90 font-mono">
                  Activity: {item.activityTitle} (+{item.points} PTS)
                </p>

                <p className="text-xs text-muted leading-relaxed">
                  {item.details}
                </p>

                {item.rejectionReason && (
                  <p className="text-xs font-mono text-red-500 border-l-2 border-red-500 pl-2">
                    Reason for rejection: {item.rejectionReason}
                  </p>
                )}

                {item.reviewedBy && (
                  <p className="text-[11px] font-mono text-muted">
                    Reviewed by: <span className="text-ink font-medium">{item.reviewedBy}</span> at {item.reviewedAt}
                  </p>
                )}
              </div>

              {/* Proof Preview & Actions */}
              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-hairline">
                {/* Proof Link / Thumbnail */}
                <a
                  href={item.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono text-muted hover:text-ink px-3 py-1.5 border border-hairline rounded hover:border-ink transition-colors"
                >
                  <div className="w-5 h-5 rounded overflow-hidden border border-hairline bg-black relative shrink-0">
                    <Image
                      src={item.proofUrl}
                      alt="Proof"
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>VIEW PROOF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {/* Approve / Reject Actions (Only for DONE items) */}
                {item.status === "DONE" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectModalId(item.id)}
                      className="px-3 py-1.5 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white rounded-sm text-xs font-mono transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      REJECT
                    </button>
                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-4 py-1.5 bg-ink text-onink hover:opacity-90 rounded-sm text-xs font-mono font-bold tracking-wider transition-opacity flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      VERIFY (+{item.points} PTS)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border border-ink/40 rounded-sm bg-paper shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Provide Audit Rejection Reason</span>
            </div>
            <p className="text-xs text-muted font-mono">
              Minimum 8 characters. This feedback will be attached to the member&apos;s audit record.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Proof screenshot is unreadable; please re-upload with full browser window..."
              rows={3}
              className="w-full px-3 py-2 border border-hairline rounded bg-paper text-xs text-ink font-mono focus:outline-none focus:border-ink"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalId(null);
                  setRejectionReason("");
                }}
                className="px-3 py-1.5 border border-hairline rounded text-xs font-mono text-muted hover:text-ink"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={rejectionReason.trim().length < 8}
                className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-mono font-bold disabled:opacity-40"
              >
                CONFIRM REJECTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
