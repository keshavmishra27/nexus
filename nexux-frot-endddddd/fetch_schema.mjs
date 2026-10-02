import fs from "fs";

async function fetchSchema() {
  const url = "https://pngrsqnoduoefdpultna.supabase.co/rest/v1/";
  const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ3JzcW5vZHVvZWZkcHVsdG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjM1NDAsImV4cCI6MjEwNTIzOTU0MH0.XtXy95JQfIYIlEqD3CkQxKb6VMmd8-9LgGH8gFzjR2M";
  
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
