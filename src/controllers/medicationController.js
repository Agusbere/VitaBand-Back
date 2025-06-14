import pool from '../database/connection.js';

export const getAllMedications = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medication');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener medicaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createMedication = async (req, res) => {
    const { id_user, start, finish, frequency, id_meds } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO medication (id_user, start, finish, frequency, id_meds)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [id_user, start, finish, frequency, id_meds]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear medicación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateMedication = async (req, res) => {
    const { id } = req.params;
    const { id_user, start, finish, frequency, id_meds } = req.body;
    try {
        const result = await pool.query(
            `UPDATE medication SET id_user=$1, start=$2, finish=$3, frequency=$4, id_meds=$5
             WHERE id=$6 RETURNING *`,
            [id_user, start, finish, frequency, id_meds, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar medicación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};