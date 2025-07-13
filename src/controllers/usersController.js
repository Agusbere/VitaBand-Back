import createGenericController from './genericController.js';
import pool from '../database/connection.js';

export const users = createGenericController({
    table: 'users',
    insertFields: ['name', 'mail', 'password', 'surname', 'birthdate', 'phone', 'created_at', 'last_sign_in', 'picture', 'id_gender'],
    updateFields: ['name', 'mail', 'password', 'surname', 'birthdate', 'phone', 'created_at', 'last_sign_in', 'picture', 'id_gender'],
    label: 'usuario'
});

// PATCH /api/users/:id/nombre
export const updateExtraData1 = async (req, res) => {
    const { id } = req.params;
    const { name, surname, birthdate } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users 
             SET name = $1, surname = $2, birthdate = $3
             WHERE id = $4
             RETURNING id, name, surname, birthdate`,
            [name, surname, birthdate, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error al actualizar datos básicos:', err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// PATCH /api/users/:id/genero
export const updateExtraData2 = async (req, res) => {
    const { id } = req.params;
    const { id_gender } = req.body;

    try {
        const genderResult = await pool.query(
            `SELECT id, name FROM gender WHERE id = $1`,
            [id_gender]
        );
        if (genderResult.rowCount === 0) {
            return res.status(404).json({ error: "El género proporcionado no existe" });
        }

        const result = await pool.query(
            `UPDATE users
             SET id_gender = $1
             WHERE id = $2
             RETURNING id, id_gender`,
            [id_gender, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const joined = await pool.query(
            `SELECT u.id, u.id_gender, g.name AS gender_name
             FROM users u
             INNER JOIN gender g ON u.id_gender = g.id
             WHERE u.id = $1`,
            [id]
        );

        res.status(200).json({ user: joined.rows[0] });
    } catch (err) {
        console.error('Error al actualizar género:', err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// PATCH /api/users/:id/foto
export const updateExtraData3 = async (req, res) => {
    const { id } = req.params;
    const { picture } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users 
             SET picture = $1
             WHERE id = $2
             RETURNING id, picture`,
            [picture, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error al actualizar foto:', err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};