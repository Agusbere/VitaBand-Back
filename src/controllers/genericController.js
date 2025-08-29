import pool from '../database/connection.js';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export default function createGenericController({ table, insertFields, updateFields, label }) {
    return {
        getAll: async (req, res) => {
            try {
                const result = await pool.query(`SELECT * FROM ${table}`);
                res.status(StatusCodes.OK).json(result.rows);
            } catch (error) {
                console.error(`Error al obtener ${label}:`, error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
                res.status(StatusCodes.CREATED).json(result.rows[0]);
            } catch (error) {
                console.error(`Error al crear ${label}:`, error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
                    return res.status(StatusCodes.NOT_FOUND).json({ error: `${label} no encontrado` });
                }
                res.status(StatusCodes.OK).json(result.rows[0]);
            } catch (error) {
                console.error(`Error al actualizar ${label}:`, error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
                    return res.status(StatusCodes.NOT_FOUND).json({ error: `${label} no encontrado` });
                }
                res.status(StatusCodes.OK).json({ message: `${label} eliminado correctamente` });
            } catch (error) {
                console.error(`Error al eliminar ${label}:`, error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
            }
        }
    };
}