import { createClient } from "@supabase/supabase-js";
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv")?.config({ path: ".env.local" });
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  console.log("Storage buckets:", buckets);
  if (bError) console.error("Buckets error:", bError);

  // Check if submit_achievement RPC exists
  const { data: rpcData, error: rpcError } = await supabase.rpc("submit_achievement", {});
  console.log("RPC submit_achievement test:", { rpcData, rpcError });
}

test();
