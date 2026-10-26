"use client";

import React, { useState, useEffect } from "react";
import { CANONICAL_ACTIVITIES, AchievementSubmission } from "@/lib/competition-data";
import { MemberProfile } from "@/lib/members-data";
import { submitAchievementApi } from "@/lib/supabase-data";
import { UploadCloud, CheckCircle, AlertCircle, ArrowRight, Link as LinkIcon, Loader2 } from "lucide-react";

interface SubmitAchievementProps {
  currentUser: {
    name: string;
    department: string;
    role: string;
    avatarUrl: string;
  };
  onSubmitSuccess: (newSubmission: AchievementSubmission) => void;
  /** Optional: live activities from Supabase activity_catalog. Falls back to CANONICAL_ACTIVITIES. */
  activities?: { id: string; title: string; category: string; points: number }[];
  /** Optional: cohort members from Supabase profiles */
  members?: MemberProfile[];
}

export function SubmitAchievement({
  currentUser,
  onSubmitSuccess,
  activities,
  members,
}: SubmitAchievementProps) {
  // Use live activities from Supabase if provided, otherwise fallback to hardcoded list
  const activityList = activities && activities.length > 0 ? activities : CANONICAL_ACTIVITIES;
  const [activityId, setActivityId] = useState(activityList[0]?.id || "");

  // Find member ID that matches currentUser if available
  const findMatchingMemberId = React.useCallback(() => {
    if (!members || members.length === 0) return "";
    const directMatch = members.find(
      (m) => m.name.toLowerCase() === currentUser.name.toLowerCase()
    );
    if (directMatch) return directMatch.id;
    const partialMatch = members.find((m) =>
      currentUser.name.toLowerCase().includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().includes(currentUser.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.id;
    return members[0]?.id || "";
  }, [members, currentUser.name]);

  const [selectedMemberId, setSelectedMemberId] = useState(findMatchingMemberId());

  // Keep selected member in sync when live Supabase members load
  useEffect(() => {
    if (members && members.length > 0) {
      const isCurrentValid = members.some((m) => m.id === selectedMemberId);
      if (!isCurrentValid) {
        const matched = findMatchingMemberId();
        setSelectedMemberId(matched || members[0].id);
      }
    }
  }, [members, selectedMemberId, findMatchingMemberId]);

  // Keep activity selection in sync when live Supabase activity catalog loads
  useEffect(() => {
    if (activityList && activityList.length > 0) {
      const isCurrentValid = activityList.some((act) => act.id === activityId);
      if (!isCurrentValid) {
        setActivityId(activityList[0].id);
      }
    }
  }, [activityList, activityId]);

  const [details, setDetails] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("File exceeds 8MB limit. Please upload an image under 8MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      setErrorMessage("Please select the contributing team member for this milestone.");
      return;
    }

    if (details.trim().length < 8) {
      setErrorMessage("Description must be at least 8 characters detailing your achievement.");
      return;
    }

    if (!selectedFile && !externalLink.trim()) {
      setErrorMessage("Please attach verifiable proof (upload a screenshot or provide a proof URL).");
      return;
    }

    // Resolve effective member ID and activity ID
    const effectiveMemberId =
      members?.find((m) => m.id === selectedMemberId)?.id ||
      members?.[0]?.id ||
      selectedMemberId;

    const effectiveActivityId =
      activityList.find((a) => a.id === activityId)?.id ||
      activityList[0]?.id ||
      activityId;

    if (!effectiveMemberId) {
      setErrorMessage("Please select the contributing team member for this milestone.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("memberId", effectiveMemberId);
      formData.append("activityId", effectiveActivityId);
      formData.append("details", details.trim());
      formData.append("occurredOn", new Date().toISOString().split("T")[0]);

      if (externalLink.trim()) {
        formData.append("externalLink", externalLink.trim());
      }
      if (selectedFile) {
        formData.append("proofFile", selectedFile);
      }

      // Live mutation via API to Supabase
      const newSubmission = await submitAchievementApi(formData);

      onSubmitSuccess(newSubmission);
      setIsSubmitting(false);
      setSuccessMessage(true);
      setDetails("");
      setExternalLink("");
      setSelectedFile(null);
      setPreviewUrl(null);

      setTimeout(() => setSuccessMessage(false), 8000);
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to persist milestone to database";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const selectedMember = members?.find((m) => m.id === selectedMemberId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 border border-hairline rounded-sm bg-paper">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
          <div>
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Submit Sprint Milestone
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Live sync to Supabase database • Queued in DONE status for Core review
            </p>
          </div>
          {/* Authenticated Member Session Indicator */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 border border-hairline rounded-sm bg-ink/5">
            <div className="text-right">
              <p className="text-xs font-bold text-ink">{currentUser.name}</p>
              <p className="text-[10px] font-mono text-muted">{currentUser.department}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3 border border-emerald-500/40 bg-emerald-500/5 rounded-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-base text-ink">
              Milestone Persisted to Database
            </h4>
            <p className="text-xs font-mono text-muted max-w-md mx-auto">
              Your achievement record has been saved to Supabase and is now live in the `DONE` queue for Core verification.
            </p>
            <button
              onClick={() => setSuccessMessage(false)}
              className="mt-2 px-4 py-1.5 text-xs font-mono border border-hairline rounded hover:border-ink transition-colors"
            >
              Submit Another Milestone
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3 border border-red-500/30 bg-red-500/5 rounded flex items-center gap-2 text-xs text-red-500 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Team Member Selection */}
            {members && members.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  Contributing Team Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-paper border border-hairline rounded-sm text-sm text-ink font-mono focus:outline-none focus:border-ink transition-colors"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} [{m.department}] {m.isLeader ? "— Guide / Lead" : `— ${m.points || 0} PTS`}
                    </option>
                  ))}
                </select>
                {selectedMember && (
                  <p className="text-[11px] font-mono text-muted mt-1">
                    Attributing points to: <span className="text-ink font-semibold">{selectedMember.name}</span> ({selectedMember.department})
                  </p>
                )}
              </div>
            )}

            {/* Activity Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Sprint Activity Category
              </label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full px-3 py-2.5 bg-paper border border-hairline rounded-sm text-sm text-ink font-mono focus:outline-none focus:border-ink transition-colors"
              >
                {activityList.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} (+{act.points} PTS) — [{act.category}]
                  </option>
                ))}
              </select>
            </div>

            {/* Milestone Details */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Achievement Details & Notes
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was achieved, PR numbers, commit hashes, or competition outcomes..."
                rows={4}
                className="w-full px-3 py-2.5 bg-paper border border-hairline rounded-sm text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            {/* Proof Attachment Drag & Drop */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Proof Attachment (Screenshot or Image up to 8MB)
              </label>
              <div className="border border-dashed border-hairline rounded-sm p-6 text-center hover:border-ink transition-colors relative bg-ink/[0.02]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {previewUrl ? (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-emerald-600 font-bold">
                      ✓ {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-[11px] text-muted">Click or drag to replace attachment</p>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-muted mx-auto" />
                    <p className="text-xs font-mono text-ink">
                      Click to browse or drop proof screenshot here
                    </p>
                    <p className="text-[10px] text-muted font-mono">
                      PNG, JPG, WEBP, GIF up to 8MB (Uploaded to secure storage)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* External URL Proof Option */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Or External Proof URL (PR Link, Certificate, LeetCode profile)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://github.com/... or https://ik.imagekit.io/..."
                  className="w-full pl-9 pr-3 py-2 bg-paper border border-hairline rounded-sm text-sm text-ink font-mono placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
                />
                <LinkIcon className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-hairline flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted">
                Initial state: <span className="text-amber-500 font-bold">DONE</span> (Pending Core review)
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-sm bg-ink text-onink font-mono text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    TRANSMITTING TO DB...
                  </>
                ) : (
                  <>
                    SUBMIT MILESTONE
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
