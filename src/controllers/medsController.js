import pool from '../database/connection.js';

export const getAllMeds = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM meds');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener medicamentos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getMedById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM meds WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener medicamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createMed = async (req, res) => {
    const { name } = req.body;

    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO meds (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear medicamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateMed = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' });
    }

    try {
        const result = await pool.query(
            'UPDATE meds SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar medicamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteMed = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM meds WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }

        res.status(200).json({ message: 'Medicamento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar medicamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
