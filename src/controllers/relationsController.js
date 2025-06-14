import pool from '../database/connection.js';

export const getAllRelations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM relations');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener relaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createRelation = async (req, res) => {
    const { id_bander, id_host, id_rels } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO relations (id_bander, id_host, id_rels) VALUES ($1, $2, $3) RETURNING *',
            [id_bander, id_host, id_rels]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear relación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateRelation = async (req, res) => {
    const { id } = req.params;
    const { id_bander, id_host, id_rels } = req.body;
    try {
        const result = await pool.query(
            'UPDATE relations SET id_bander = $1, id_host = $2, id_rels = $3 WHERE id = $4 RETURNING *',
            [id_bander, id_host, id_rels, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar relación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};