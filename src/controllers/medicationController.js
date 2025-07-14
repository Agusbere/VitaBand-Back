import createGenericController from './genericController.js';
import pool from '../database/connection.js';

export const medication = createGenericController({
    table: 'medication',
    insertFields: ['id_user', 'start', 'finish', 'frequency', 'id_meds'],
    updateFields: ['id_user', 'start', 'finish', 'frequency', 'id_meds'],
    label: 'medicación'
});

export const getAllMedications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                medication.*,
                meds.name as med_name
            FROM medication 
            JOIN meds ON medication.id_meds = meds.id 
            WHERE medication.id_user = $1 
            ORDER BY medication.start DESC
        `, [userId]);
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error obteniendo medicaciones:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getMedicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const result = await pool.query(`
            SELECT 
                medication.*,
                meds.name as med_name
            FROM medication 
            JOIN meds ON medication.id_meds = meds.id 
            WHERE medication.id = $1 AND medication.id_user = $2
        `, [id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo medicación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createMedication = async (req, res) => {
    try {
        const { start, finish, frecuency, id_meds } = req.body;
        const userId = req.user.id;
        
        if (!start || !finish || !frecuency || !id_meds) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const medExists = await pool.query('SELECT id FROM meds WHERE id = $1', [id_meds]);
        if (medExists.rows.length === 0) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }
        
        const result = await pool.query(`
            INSERT INTO medication (id_user, start, finish, frecuency, id_meds) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `, [userId, start, finish, frecuency, id_meds]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creando medicación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { start, finish, frecuency, id_meds } = req.body;
        
        if (id_meds) {
            const medExists = await pool.query('SELECT id FROM meds WHERE id = $1', [id_meds]);
            if (medExists.rows.length === 0) {
                return res.status(404).json({ error: 'Medicamento no encontrado' });
            }
        }
        
        const result = await pool.query(`
            UPDATE medication 
            SET start = $1, finish = $2, frecuency = $3, id_meds = $4
            WHERE id = $5 AND id_user = $6 
            RETURNING *
        `, [start, finish, frecuency, id_meds, id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando medicación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const reminderCheck = await pool.query(
            'SELECT id FROM reminder WHERE id_medication = $1',
            [id]
        );

        if (reminderCheck.rows.length > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar: hay recordatorios asociados a esta medicación' 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM medication WHERE id = $1 AND id_user = $2 RETURNING *',
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }
        
        res.status(200).json({ message: 'Medicación eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando medicación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getMedicationByIdWithUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT 
        medication.*,
        users.name AS user_name,
        users.mail AS user_email,
        users.birthdate,
        users.phone
      FROM medication
      INNER JOIN users ON users.id = medication.id_user
      WHERE medication.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener medicación con usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
