import createGenericController from './genericController.js';
import pool from '../database/connection.js';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import supabase from '../database/supabaseClient.js';

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
            return res.status(StatusCodes.BAD_REQUEST).json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }
        const genderResult = await pool.query('SELECT id FROM gender WHERE id = $1', [id_gender]);
        if (genderResult.rowCount === 0) {
            return res.status(404).json({ error: 'El género no existe' });
        }
        const result = await pool.query(
            `UPDATE users SET name = $1, surname = $2, birthdate = $3, id_gender = $4 WHERE id = $5 RETURNING id, name, surname, birthdate, id_gender`,
            [name, surname, birthdate, id_gender, userId]
        );
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};


export const updateExtraData2 = async (req, res) => {
    const userId = req.user.id;
    try {
        console.log('updateExtraData2: inicio');
        console.log('req.file:', req.file);
        const publicUrl = await uploadProfilePicture(req, res, true);
        console.log('publicUrl recibido:', publicUrl);
        if (!publicUrl) {
            console.log('No se obtuvo publicUrl, uploadProfilePicture ya respondió');
            return;
        }
        const result = await pool.query(
            `UPDATE users SET picture = $1 WHERE id = $2 RETURNING id, picture`,
            [publicUrl, userId]
        );
        console.log('updateExtraData2: update result', result.rows[0]);
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('updateExtraData2: error', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const uploadProfilePicture = async (req, res, returnUrlOnly = false) => {
    const userId = req.user.id;
    console.log('uploadProfilePicture: inicio');
    if (!req.file) {
        console.log('uploadProfilePicture: req.file no existe');
        if (returnUrlOnly) return null;
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No se recibió el archivo. Usa el campo "image".' });
    }
    const ext = req.file.originalname.split('.').pop();
    const filePath = `users/${userId}/profile-picture.${ext}`;
    console.log('uploadProfilePicture: filePath', filePath);
    try {
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
        if (uploadError) {
            console.log('uploadProfilePicture: uploadError', uploadError);
            if (returnUrlOnly) return null;
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error subiendo imagen a Supabase' });
        }
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;
        console.log('uploadProfilePicture: publicUrl', publicUrl);
        if (returnUrlOnly) return publicUrl;
        res.status(StatusCodes.OK).json({ url: publicUrl });
    } catch (err) {
        console.error('uploadProfilePicture: error', err);
        if (returnUrlOnly) return null;
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Usuario no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error obteniendo perfil:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let { name, surname, birthdate, phone, picture, id_gender } = req.body;
        if (req.file) {
            const ext = req.file.originalname.split('.').pop();
            const filePath = `users/${userId}/profile-picture.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
            if (uploadError) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error subiendo imagen a Supabase' });
            }
            const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
            picture = data.publicUrl;
        }
        if (id_gender) {
            const genderExists = await pool.query('SELECT id FROM gender WHERE id = $1', [id_gender]);
            if (genderExists.rows.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: 'Género no encontrado' });
            }
        }
        const result = await pool.query(`
            UPDATE users 
            SET name = $1, surname = $2, birthdate = $3, phone = $4, picture = $5, id_gender = $6
            WHERE id = $7 
            RETURNING id, name, mail, surname, birthdate, phone, picture, id_gender
        `, [name, surname, birthdate, phone, picture, id_gender, userId]);
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando perfil:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'No puedes eliminar tu cuenta mientras tengas relaciones activas' 
            });
        }

        await pool.query('DELETE FROM reminder WHERE id_medication IN (SELECT id FROM medication WHERE id_user = $1)', [userId]);
        await pool.query('DELETE FROM medication WHERE id_user = $1', [userId]);
        
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING mail', [userId]);
        
        res.status(200).json({ message: 'Cuenta eliminada correctamente' });
    } catch (err) {
        console.error('Error eliminando perfil:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};