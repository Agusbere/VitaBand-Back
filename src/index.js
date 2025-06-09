import express from "express";
import genderRoutes from "./routes/genderRoutes.js";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend conectado a Supabase");
});

app.use("/generos", genderRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
