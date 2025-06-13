import express from 'express';
import cors from 'cors';
import genderRoutes from './routes/genderRoutes.js';
import medsRoutes from './routes/medsRouter.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', genderRoutes);
app.use('/api', medsRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
