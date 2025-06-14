import pool from '../database/connection.js';

export const getAllGenders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gender');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener géneros:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createGender = async (req, res) => {
    const { name } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO gender (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear género:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateGender = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const result = await pool.query(
            'UPDATE gender SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Género no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar género:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
