import createGenericController from './genericController.js';
import pool from '../database/connection.js';
import path from 'path';

export const users = createGenericController({
    table: 'users',
    insertFields: ['name', 'mail', 'password', 'surname', 'birthdate', 'phone', 'created_at', 'last_sign_in', 'picture', 'id_gender'],
    updateFields: ['name', 'mail', 'password', 'surname', 'birthdate', 'phone', 'created_at', 'last_sign_in', 'picture', 'id_gender'],
    label: 'usuario'
});

export const updateExtraData1 = async (req, res) => {
    const userId = req.user.id;
    const { name, surname, birthdate, id_gender } = req.body;
    try {
        if (!name || !surname || !birthdate || !id_gender) {
            return res.status(400).json({ error: 'Faltan datos' });
        }
        const genderResult = await pool.query('SELECT id FROM gender WHERE id = $1', [id_gender]);
        if (genderResult.rowCount === 0) {
            return res.status(404).json({ error: 'El género no existe' });
        }
        const result = await pool.query(
            `UPDATE users SET name = $1, surname = $2, birthdate = $3, id_gender = $4 WHERE id = $5 RETURNING id, name, surname, birthdate, id_gender`,
            [name, surname, birthdate, id_gender, userId]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateExtraData2 = async (req, res) => {
    const userId = req.user.id;
    const { picture } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET picture = $1 WHERE id = $2 RETURNING id, picture`,
            [picture, userId]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió el archivo. Usa el campo "image".' });
        }

        const relativePath = path.join('users', userId.toString(), req.file.filename);
        const publicUrl = `/static/${relativePath}`;

        const result = await pool.query(
            `UPDATE users SET picture = $1 WHERE id = $2 RETURNING id, picture`,
            [publicUrl, userId]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getBasicData = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT id, name, surname, birthdate, id_gender, picture FROM users WHERE id = $1`,
            [userId]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                users.id, 
                users.name, 
                users.mail, 
                users.surname, 
                users.birthdate, 
                users.phone, 
                users.created_at, 
                users.picture, 
                users.id_gender, 
                gender.name as gender_name
            FROM users 
            LEFT JOIN gender ON users.id_gender = gender.id
            WHERE users.id = $1
        `, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo perfil:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let { name, surname, birthdate, phone, picture, id_gender } = req.body;
        
        if (req.file) {
            const relativePath = path.join('users', userId.toString(), req.file.filename);
            picture = `/static/${relativePath}`;
        }
        
        if (id_gender) {
            const genderExists = await pool.query('SELECT id FROM gender WHERE id = $1', [id_gender]);
            if (genderExists.rows.length === 0) {
                return res.status(404).json({ error: 'Género no encontrado' });
            }
        }
        
        const result = await pool.query(`
            UPDATE users 
            SET name = $1, surname = $2, birthdate = $3, phone = $4, picture = $5, id_gender = $6
            WHERE id = $7 
            RETURNING id, name, mail, surname, birthdate, phone, picture, id_gender
        `, [name, surname, birthdate, phone, picture, id_gender, userId]);
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando perfil:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const hasRelations = await pool.query(
            'SELECT id FROM relations WHERE id_bander = $1 OR id_host = $1',
            [userId]
        );

        if (hasRelations.rows.length > 0) {
            return res.status(400).json({ 
                error: 'No puedes eliminar tu cuenta mientras tengas relaciones activas' 
            });
        }

        await pool.query('DELETE FROM reminder WHERE id_medication IN (SELECT id FROM medication WHERE id_user = $1)', [userId]);
        await pool.query('DELETE FROM medication WHERE id_user = $1', [userId]);
        
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING mail', [userId]);
        
        res.status(200).json({ message: 'Cuenta eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando perfil:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};