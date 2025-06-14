import pool from '../database/connection.js';

export const getAllColors = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM color');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener colores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createColor = async (req, res) => {
    const { name, hexa } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO color (name, hexa) VALUES ($1, $2) RETURNING *',
            [name, hexa]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear color:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateColor = async (req, res) => {
    const { id } = req.params;
    const { name, hexa } = req.body;
    try {
        const result = await pool.query(
            'UPDATE color SET name = $1, hexa = $2 WHERE id = $3 RETURNING *',
            [name, hexa, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Color no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar color:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};