const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

const supabase = createClient(
  'https://hcsjfvirqtjmvkmqngsg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjc2pmdmlycXRqbXZrbXFuZ3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk1MDEsImV4cCI6MjA2MzU4NTUwMX0.ujybtGbUqnvcPkriZ4oA5Zy-ijNMG53o2uKxdgTTi74'
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend conectado a Supabase");
});

app.get("/generos", async (req, res) => {
  const { data, error } = await supabase.from('gender').select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
