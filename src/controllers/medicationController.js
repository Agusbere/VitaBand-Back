import createGenericController from './genericController.js';
import pool from '../database/connection.js';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

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
        
    res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        console.error('Error obteniendo medicaciones:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicación no encontrada' });
        }
        
    res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo medicación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const createMedication = async (req, res) => {
    try {
        const { start, finish, frecuency, id_meds } = req.body;
        const userId = req.user.id;
        
        if (!start || !finish || !frecuency || !id_meds) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }

        const medExists = await pool.query('SELECT id FROM meds WHERE id = $1', [id_meds]);
        if (medExists.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicamento no encontrado' });
        }
        
        const result = await pool.query(`
            INSERT INTO medication (id_user, start, finish, frecuency, id_meds) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `, [userId, start, finish, frecuency, id_meds]);
        
    res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        console.error('Error creando medicación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
                return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicamento no encontrado' });
            }
        }
        
        const result = await pool.query(`
            UPDATE medication 
            SET start = $1, finish = $2, frecuency = $3, id_meds = $4
            WHERE id = $5 AND id_user = $6 
            RETURNING *
        `, [start, finish, frecuency, id_meds, id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicación no encontrada' });
        }
        
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando medicación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'No se puede eliminar: hay recordatorios asociados a esta medicación' 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM medication WHERE id = $1 AND id_user = $2 RETURNING *',
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicación no encontrada' });
        }
        
        res.status(StatusCodes.OK).json({ message: 'Medicación eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando medicación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Medicación no encontrada' });
        }

    res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener medicación con usuario:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};
