import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TEAM_ID = "54a0575b-8f20-4882-9d4f-391c94ffd560";


/**
 * POST /api/submissions
 * Submits a new milestone to Supabase `submissions` table
 */
export async function POST(req: Request) {
  try {
    const supabase = getServiceSupabase();
    const formData = await req.formData();

    const memberId = formData.get("memberId") as string;
    const activityId = formData.get("activityId") as string;
    const details = (formData.get("details") as string) || "";
    const externalLink = (formData.get("externalLink") as string) || "";
    const occurredOn =
      (formData.get("occurredOn") as string) ||
      new Date().toISOString().split("T")[0];

    const proofFile = formData.get("proofFile") as File | null;

    if (!memberId || !activityId || details.trim().length < 8) {
      return NextResponse.json(
        { error: "Missing required fields: member, activity, or details (min 8 chars)" },
        { status: 400 }
      );
    }

    let proofUrl = externalLink.trim();

    // 1. If proof file is provided, upload to Supabase storage 'proofs' bucket
    if (proofFile && typeof proofFile === "object" && proofFile.size > 0) {
      try {
        const fileBuffer = Buffer.from(await proofFile.arrayBuffer());
        const originalName = proofFile.name || "proof.png";
        const fileExt = originalName.split(".").pop() || "png";
        const storagePath = `proofs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

        // Ensure bucket exists or upload directly
        const { error: uploadError } = await supabase.storage
          .from("proofs")
          .upload(storagePath, fileBuffer, {
            contentType: proofFile.type || "image/png",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("proofs")
            .getPublicUrl(storagePath);
          if (urlData?.publicUrl) {
            proofUrl = urlData.publicUrl;
          }
        } else {
          console.warn("Storage upload failed, using fallback:", uploadError.message);
        }
      } catch (uploadErr) {
        console.warn("File processing failed:", uploadErr);
      }
    }

    // Fallback proof URL if none provided
    if (!proofUrl) {
      proofUrl = "/logo/official_jewel.png";
    }

    // 2. Fetch member profile
    const { data: profile, error: profError } = await supabase
      .from("profiles")
      .select("id, full_name, department")
      .eq("id", memberId)
      .single();

    if (profError || !profile) {
      return NextResponse.json(
        { error: `Member profile not found for id ${memberId}` },
        { status: 404 }
      );
    }

    // 3. Fetch activity catalog details
    const { data: activity } = await supabase
      .from("activity_catalog")
      .select("id, label, level, points, category")
      .eq("id", activityId)
      .single();

    const activityTitle = activity?.label
      ? activity.level
        ? `${activity.label} — ${activity.level}`
        : activity.label
      : "Sprint Milestone";

    const points = activity?.points ?? 20;

    // 4. Insert submission into Supabase table
    const submissionRecord = {
      member_id: memberId,
      team_id: TEAM_ID,
      activity_id: activityId,
      occurred_on: occurredOn,
      title: `Nexus: ${profile.full_name || "Member"}`,
      details: details.trim(),
      external_url: proofUrl,
      status: "pending",
    };

    const { data: inserted, error: insertError } = await supabase
      .from("submissions")
      .insert(submissionRecord)
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to insert submission" },
        { status: 500 }
      );
    }

    const createdSubmission = {
      id: inserted.id,
      memberName: profile.full_name ?? "Unknown",
      department: profile.department ?? "Technical",
      team: "Nexus",
      achievedOn: occurredOn,
      details: details.trim(),
      proofUrl: proofUrl,
      status: "DONE" as const, // In UI, DONE means submitted & awaiting Core verification
      activityTitle,
      points,
      submittedAt: "Just now",
    };

    return NextResponse.json({
      success: true,
      submission: createdSubmission,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("API error in POST /api/submissions:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/submissions
 * Review action: Verify or Reject a submission
 */
export async function PATCH(req: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await req.json();
    const { id, action, points, reviewerName, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing required fields: id and action ('verify' | 'reject')" },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const isUuid = (str?: string) =>
      typeof str === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const reviewerUuid = isUuid(reviewerName) ? reviewerName : null;

    if (action === "verify") {
      const awardedPoints = Number(points) || 0;
      const updateData: Record<string, unknown> = {
        status: "verified",
        awarded_points: awardedPoints,
        net_points: awardedPoints,
        decided_at: nowIso,
      };

      if (reviewerUuid) {
        updateData.decided_by = reviewerUuid;
      }
      if (reviewerName && !reviewerUuid) {
        updateData.decision_note = `Verified by ${reviewerName}`;
      }

      const { data, error } = await supabase
        .from("submissions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error verifying submission:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "verified",
        updated: data,
      });
    } else if (action === "reject") {
      const note = reason
        ? (reviewerName && !reviewerUuid ? `${reason} (Rejected by ${reviewerName})` : reason)
        : `Rejected by ${reviewerName || "Core Reviewer"}`;

      const updateData: Record<string, unknown> = {
        status: "rejected",
        decision_note: note,
        awarded_points: 0,
        net_points: 0,
        decided_at: nowIso,
      };

      if (reviewerUuid) {
        updateData.decided_by = reviewerUuid;
      }

      const { data, error } = await supabase
        .from("submissions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error rejecting submission:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "rejected",
        updated: data,
      });
    } else {
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("API error in PATCH /api/submissions:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
