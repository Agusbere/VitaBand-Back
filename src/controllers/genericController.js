import pool from '../database/connection.js';

export default function createGenericController({ table, insertFields, updateFields, label }) {
    return {
        getAll: async (req, res) => {
            try {
                const result = await pool.query(`SELECT * FROM ${table}`);
                res.status(200).json(result.rows);
            } catch (error) {
                console.error(`Error al obtener ${label}:`, error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        },

        create: async (req, res) => {
            const values = insertFields.map(field => req.body[field]);
            const placeholders = insertFields.map((_, i) => `$${i + 1}`).join(', ');
            const fieldsString = insertFields.join(', ');

            try {
                const result = await pool.query(
                    `INSERT INTO ${table} (${fieldsString}) VALUES (${placeholders}) RETURNING *`,
                    values
                );
                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error(`Error al crear ${label}:`, error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        },

        update: async (req, res) => {
            const { id } = req.params;
            const values = updateFields.map(field => req.body[field]);
            const setClause = updateFields.map((field, i) => `${field} = $${i + 1}`).join(', ');

            try {
                const result = await pool.query(
                    `UPDATE ${table} SET ${setClause} WHERE id = $${updateFields.length + 1} RETURNING *`,
                    [...values, id]
                );
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: `${label} no encontrado` });
                }
                res.status(200).json(result.rows[0]);
            } catch (error) {
                console.error(`Error al actualizar ${label}:`, error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        },

        delete: async (req, res) => {
            const { id } = req.params;
            try {
                const result = await pool.query(
                    `DELETE FROM ${table} WHERE id = $1 RETURNING *`,
                    [id]
                );
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: `${label} no encontrado` });
                }
                res.status(200).json({ message: `${label} eliminado correctamente` });
            } catch (error) {
                console.error(`Error al eliminar ${label}:`, error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
    };
}
