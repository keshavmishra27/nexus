import { createClient } from "@supabase/supabase-js";
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv")?.config({ path: "../.env" });
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: profiles, error: profError } = await supabase.from("profiles").select("*");
  console.log("All Profiles count:", profiles?.length);
  if (profiles && profiles.length > 0) {
    console.log("First profile:", profiles[0]);
  }
  if (profError) console.error("Profiles error:", profError);
}

test();
