import express from 'express';
import cors from 'cors';
import genderRoutes from './routes/genderRoutes.js';
import medsRoutes from './routes/medsRouter.js';
import usersRoutes from './routes/usersRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import relationsRoutes from './routes/relationsRoutes.js';
import relsRoutes from './routes/relsRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', genderRoutes);
app.use('/api', medsRoutes);
app.use('/api', usersRoutes);
app.use('/api', medicationRoutes);
app.use('/api', reminderRoutes);
app.use('/api', colorRoutes);
app.use('/api', relationsRoutes);
app.use('/api', relsRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
