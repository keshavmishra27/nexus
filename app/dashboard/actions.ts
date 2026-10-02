import { supabaseServer } from "@/lib/supabase-server";

export async function getTeamMembersData(currentUserId?: string) {
  const supabase = await supabaseServer();
  
  const { data: subData, error: subError } = await supabase
    .from('submissions')
    .select('*, profiles(full_name, department, sprint_track, avatar_path), activity_catalog(label, points)')
    .order('submitted_at', { ascending: false });

  const { data: profData, error: profError } = await supabase
    .from('profiles')
    .select('*');

  if (subError || profError) {
    console.error("Error fetching data:", subError || profError);
    return [];
  }

  const members = (profData || []).map((prof) => {
    const memberSubs = (subData || []).filter(s => s.member_id === prof.id);
    
    // Aggregate points (forcing all to be considered done/verified)
    let totalPoints = 0;
    const departmentsMap = new Map<string, number>();

    memberSubs.forEach(s => {
      const pts = s.activity_catalog?.points || 0;
      totalPoints += pts;
      const dept = s.activity_catalog?.label || 'General';
      departmentsMap.set(dept, (departmentsMap.get(dept) || 0) + pts);
    });

    const departments = Array.from(departmentsMap.entries()).map(([name, points]) => ({ name, points }));
    if (departments.length === 0) {
      departments.push({ name: prof.department || "Core", points: totalPoints || 0 });
    }

    const role = prof.sprint_track || "Member";

    return {
      id: prof.id,
      name: prof.full_name || 'Unknown',
      totalPoints,
      role,
      title: prof.department || "Member",
      avatar: prof.avatar_path || `https://api.dicebear.com/9.x/avataaars/svg?seed=${prof.full_name}`,
      departments,
      color: "slate", // Will be assigned based on rank
      spark: [14, 16, 20, 24, 15, Math.max(5, Math.min(25, 10 + (totalPoints % 15)))],
      isYou: prof.id === currentUserId
    };
  });

  return members.sort((a, b) => b.totalPoints - a.totalPoints).map((m, i) => {
    let color = "slate";
    if (i === 0) color = "magenta";
    else if (i === 1) color = "cyan";
    
    return {
      ...m,
      color
    };
  });
}
