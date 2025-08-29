import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hcsjfvirqtjmvkmqngsg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjc2pmdmlycXRqbXZrbXFuZ3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk1MDEsImV4cCI6MjA2MzU4NTUwMX0.ujybtGbUqnvcPkriZ4oA5Zy-ijNMG53o2uKxdgTTi74"
);

export default supabase;
