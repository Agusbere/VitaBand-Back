import createGenericController from './genericController.js';
import pool from '../database/connection.js';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const reminder = createGenericController({
    table: 'reminder',
    insertFields: ['title', 'description', 'id_color', 'repetition', 'confirmed', 'id_medication', 'hour', 'min'],
    updateFields: ['title', 'description', 'id_color', 'repetition', 'confirmed', 'id_medication', 'hour', 'min'],
    label: 'recordatorio'
});

export const getAllReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                reminder.*,
                color.name as color_name,
                color.hexa,
                medication.id_meds,
                meds.name as med_name
            FROM reminder 
            LEFT JOIN color ON reminder.id_color = color.id
            LEFT JOIN medication ON reminder.id_medication = medication.id
            LEFT JOIN meds ON medication.id_meds = meds.id
            WHERE medication.id_user = $1 OR reminder.id_medication IS NULL
            ORDER BY reminder.id DESC
        `, [userId]);
        
    res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        console.error('Error obteniendo recordatorios:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const getReminderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const result = await pool.query(`
            SELECT 
                reminder.*,
                color.name as color_name,
                color.hexa,
                medication.id_meds,
                meds.name as med_name
            FROM reminder 
            LEFT JOIN color ON reminder.id_color = color.id
            LEFT JOIN medication ON reminder.id_medication = medication.id
            LEFT JOIN meds ON medication.id_meds = meds.id
            WHERE reminder.id = $1 AND (medication.id_user = $2 OR reminder.id_medication IS NULL)
        `, [id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Recordatorio no encontrado' });
        }
        
    res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo recordatorio:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const createReminder = async (req, res) => {
    try {
        const { title, description, id_color, repetition, id_medication, hour, min } = req.body;
        const userId = req.user.id;
        
        if (!title || !description || !id_color || repetition === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }

        if (id_color) {
            const colorExists = await pool.query('SELECT id FROM color WHERE id = $1', [id_color]);
            if (colorExists.rows.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: 'Color no encontrado' });
            }
        }
        
        if (id_medication) {
            const medicationCheck = await pool.query(
                'SELECT id FROM medication WHERE id = $1 AND id_user = $2',
                [id_medication, userId]
            );
            
            if (medicationCheck.rows.length === 0) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: getReasonPhrase(StatusCodes.FORBIDDEN) });
            }
        }
        
        const result = await pool.query(`
            INSERT INTO reminder (title, description, id_color, repetition, confirmed, id_medication, hour, min) 
            VALUES ($1, $2, $3, $4, false, $5, $6, $7) 
            RETURNING *
        `, [title, description, id_color, repetition, id_medication, hour, min]);
        
    res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        console.error('Error creando recordatorio:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, id_color, repetition, confirmed, id_medication, hour, min } = req.body;
        
        if (id_color) {
            const colorExists = await pool.query('SELECT id FROM color WHERE id = $1', [id_color]);
            if (colorExists.rows.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: 'Color no encontrado' });
            }
        }
        
        if (id_medication) {
            const medicationCheck = await pool.query(
                'SELECT id FROM medication WHERE id = $1 AND id_user = $2',
                [id_medication, userId]
            );
            
            if (medicationCheck.rows.length === 0) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: getReasonPhrase(StatusCodes.FORBIDDEN) });
            }
        }
        
        const reminderCheck = await pool.query(`
            SELECT reminder.id FROM reminder 
            LEFT JOIN medication ON reminder.id_medication = medication.id
            WHERE reminder.id = $1 AND (medication.id_user = $2 OR reminder.id_medication IS NULL)
        `, [id, userId]);
        
        if (reminderCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Recordatorio no encontrado' });
        }
        
        const result = await pool.query(`
            UPDATE reminder 
            SET title = $1, description = $2, id_color = $3, repetition = $4, 
                confirmed = $5, id_medication = $6, hour = $7, min = $8
            WHERE id = $9
            RETURNING *
        `, [title, description, id_color, repetition, confirmed, id_medication, hour, min, id]);
        
    res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando recordatorio:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const reminderCheck = await pool.query(`
            SELECT reminder.id FROM reminder 
            LEFT JOIN medication ON reminder.id_medication = medication.id
            WHERE reminder.id = $1 AND (medication.id_user = $2 OR reminder.id_medication IS NULL)
        `, [id, userId]);
        
        if (reminderCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Recordatorio no encontrado' });
        }
        
    await pool.query('DELETE FROM reminder WHERE id = $1', [id]);
    res.status(StatusCodes.OK).json({ message: 'Recordatorio eliminado correctamente' });
    } catch (err) {
        console.error('Error eliminando recordatorio:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};
