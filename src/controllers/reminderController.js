import pool from '../database/connection.js';

export const getAllReminders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reminder');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener recordatorios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createReminder = async (req, res) => {
    const { title, description, id_color, repetition, confirmed, id_medication, hour, min } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO reminder (title, description, id_color, repetition, confirmed, id_medication, hour, min)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [title, description, id_color, repetition, confirmed, id_medication, hour, min]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear recordatorio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateReminder = async (req, res) => {
    const { id } = req.params;
    const { title, description, id_color, repetition, confirmed, id_medication, hour, min } = req.body;
    try {
        const result = await pool.query(
            `UPDATE reminder SET title=$1, description=$2, id_color=$3, repetition=$4, confirmed=$5, id_medication=$6, hour=$7, min=$8
             WHERE id=$9 RETURNING *`,
            [title, description, id_color, repetition, confirmed, id_medication, hour, min, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Recordatorio no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar recordatorio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};