import fs from "fs";

async function fetchSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/";
  const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const response = await fetch(url, {
    headers: {
      apikey: apikey
    }
  });
  const data = await response.json();
  fs.writeFileSync("schema.json", JSON.stringify(data, null, 2));
  console.log("Schema saved to schema.json");
  console.log("Paths available:");
  console.log(Object.keys(data.paths).join(", "));
}

fetchSchema();
