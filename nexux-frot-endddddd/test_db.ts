import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: profiles, error: profError } = await supabase.from("profiles").select("*");
  console.log("All Profiles:", profiles);
  if (profError) console.error("Profiles error:", profError);

  const { data: users, error: usersError } = await supabase.from("users").select("*");
  console.log("All Users:", users);
  
  const { data: team_members, error: membersError } = await supabase.from("team_members").select("*");
  console.log("Team members:", team_members);
}

test();
