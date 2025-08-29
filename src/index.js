import express from 'express';
import cors from 'cors';
import path from 'path';

import genderRoutes from './routes/genderRoutes.js';
import medsRoutes from './routes/medsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import relationsRoutes from './routes/relationsRoutes.js';
import relsRoutes from './routes/relsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// app.use('/static', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/gender', genderRoutes);
app.use('/api/meds', medsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/medication', medicationRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/relations', relationsRoutes);
app.use('/api/rels', relsRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
