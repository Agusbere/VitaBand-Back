import pool from '../database/connection.js';

export const getAllRels = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rels');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener tipos de relación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createRel = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO rels (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear tipo de relación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateRel = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query(
            'UPDATE rels SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Tipo de relación no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar tipo de relación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};