"use client";

import React, { useState } from "react";
import { CANONICAL_ACTIVITIES, AchievementSubmission } from "@/lib/competition-data";
import { UploadCloud, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

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
}

export function SubmitAchievement({ currentUser, onSubmitSuccess, activities }: SubmitAchievementProps) {
  // Use live activities from Supabase if provided, otherwise fallback to hardcoded list
  const activityList = activities && activities.length > 0 ? activities : CANONICAL_ACTIVITIES;
  const [activityId, setActivityId] = useState(activityList[0].id);
  const [details, setDetails] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 12) {
      setErrorMessage("Description must be at least 12 characters detailing your achievement.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Please attach verifiable proof (screenshot, PR preview, certificate).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const matchedActivity = activityList.find((a) => a.id === activityId)!;

    // Simulate Server Action call matching app/actions/achievements.ts
    setTimeout(() => {
      const newSubmission: AchievementSubmission = {
        id: `sub-${Date.now()}`,
        memberName: currentUser.name,
        department: currentUser.department,
        team: "Nexus",
        achievedOn: new Date().toISOString().split("T")[0],
        details: details.trim(),
        proofUrl: previewUrl || "/logo/official_jewel.png",
        status: "DONE",
        activityTitle: matchedActivity.title,
        points: matchedActivity.points,
        submittedAt: "Just now",
      };

      onSubmitSuccess(newSubmission);
      setIsSubmitting(false);
      setSuccessMessage(true);
      setDetails("");
      setSelectedFile(null);
      setPreviewUrl(null);

      setTimeout(() => setSuccessMessage(false), 5000);
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 border border-hairline rounded-sm bg-paper">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
          <div>
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Submit Sprint Milestone
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Auto-authenticated session • Target review window: &lt;4 hours
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
              Milestone Submitted Successfully
            </h4>
            <p className="text-xs font-mono text-muted max-w-md mx-auto">
              Your achievement record has been persisted locally in PostgreSQL and queued in `DONE` state for Core verification.
            </p>
            <button
              onClick={() => setSuccessMessage(false)}
              className="mt-2 px-4 py-1.5 text-xs font-mono border border-hairline rounded hover:border-ink"
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

            {/* Canonical Activity Selection */}
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
                Achievement Details & Proof Description
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was achieved, PR numbers, commit hashes, or competition outcomes (min 12 chars)..."
                rows={4}
                className="w-full px-3 py-2.5 bg-paper border border-hairline rounded-sm text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            {/* Proof Attachment Drag & Drop */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Proof Attachment (Image max 8MB)
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
                      PNG, JPG, WEBP, GIF up to 8MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-hairline flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted">
                Status on submission: <span className="text-amber-500 font-bold">DONE</span>
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-sm bg-ink text-onink font-mono text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "TRANSMITTING..." : "SUBMIT MILESTONE"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
