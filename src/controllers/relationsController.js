import pool from '../database/connection.js';

export const createRelation = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { target_user_id, id_rels } = req.body;

        if (!target_user_id || !id_rels) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        if (currentUserId === parseInt(target_user_id)) {
            return res.status(400).json({ error: 'No puedes crear una relación contigo mismo' });
        }

        const usersQuery = await pool.query(
            'SELECT id, user_role, name FROM users WHERE id IN ($1, $2)',
            [currentUserId, target_user_id]
        );

        if (usersQuery.rows.length !== 2) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const currentUser = usersQuery.rows.find(user => user.id == currentUserId);
        const targetUser = usersQuery.rows.find(user => user.id == target_user_id);

        if (currentUser.user_role === targetUser.user_role) {
            return res.status(400).json({ 
                error: 'No puedes conectarte con alguien del mismo tipo de usuario' 
            });
        }

        let id_bander, id_host;
        if (currentUser.user_role === false || currentUser.user_role === null) {
            id_bander = currentUserId;
            id_host = target_user_id;
        } else {
            id_bander = target_user_id;
            id_host = currentUserId;
        }

        const existingRelation = await pool.query(
            'SELECT id FROM relations WHERE id_bander = $1 AND id_host = $2',
            [id_bander, id_host]
        );

        if (existingRelation.rows.length > 0) {
            return res.status(409).json({ error: 'Esta relación ya existe' });
        }

        const relTypeQuery = await pool.query(
            'SELECT name FROM rels WHERE id = $1',
            [id_rels]
        );

        if (relTypeQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Tipo de relación no válido' });
        }

        const result = await pool.query(
            'INSERT INTO relations (id_bander, id_host, id_rels) VALUES ($1, $2, $3) RETURNING *',
            [id_bander, id_host, id_rels]
        );

        res.status(201).json({
            message: 'Relación creada exitosamente',
            relation: result.rows[0]
        });

    } catch (err) {
        console.error('Error creando relación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getMyRelations = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT 
                relations.id,
                relations.id_bander,
                relations.id_host,
                relations.id_rels,
                bander.name as bander_name,
                bander.mail as bander_mail,
                hoster.name as hoster_name,
                hoster.mail as hoster_mail,
                rels.name as relation_type,
                (CASE 
                    WHEN relations.id_bander = $1 
                    THEN 'bander'
                    ELSE 'hoster'
                END) as my_role,
                (CASE 
                    WHEN relations.id_bander = $1 
                    THEN relations.id_host
                    ELSE relations.id_bander
                END) as connected_user_id,
                (CASE 
                    WHEN relations.id_bander = $1 
                    THEN hoster.name
                    ELSE bander.name
                END) as connected_user_name
            FROM relations
            JOIN users bander ON relations.id_bander = bander.id
            JOIN users hoster ON relations.id_host = hoster.id
            LEFT JOIN rels ON relations.id_rels = rels.id
            WHERE relations.id_bander = $1 OR relations.id_host = $1
            ORDER BY relations.id DESC
        `, [userId]);

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error obteniendo relaciones:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const findAvailableUsers = async (req, res) => {
    try {
        const userId = req.user.id;

        const userQuery = await pool.query(
            'SELECT user_role FROM users WHERE id = $1',
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userRole = userQuery.rows[0].user_role;
        const targetRole = !userRole;

        const result = await pool.query(`
            SELECT users.id, users.name, users.mail, users.phone
            FROM users
            WHERE users.user_role = $1
            AND users.id != $2
            AND users.id NOT IN (
                SELECT (CASE 
                    WHEN $3 = false 
                    THEN relations.id_host 
                    ELSE relations.id_bander 
                END)
                FROM relations 
                WHERE (CASE 
                    WHEN $3 = false 
                    THEN relations.id_bander = $2
                    ELSE relations.id_host = $2
                END)
            )
            ORDER BY users.created_at DESC
        `, [targetRole, userId, userRole]);

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error buscando usuarios:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteRelation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM relations WHERE id = $1 AND (id_bander = $2 OR id_host = $2) RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }

        res.status(200).json({ message: 'Relación eliminada exitosamente' });

    } catch (err) {
        console.error('Error eliminando relación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getRelationById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                relations.*,
                bander.name as bander_name,
                bander.mail as bander_mail,
                hoster.name as hoster_name,
                hoster.mail as hoster_mail,
                rels.name as relation_type
            FROM relations
            JOIN users bander ON relations.id_bander = bander.id
            JOIN users hoster ON relations.id_host = hoster.id
            LEFT JOIN rels ON relations.id_rels = rels.id
            WHERE relations.id = $1 OR (relations.id_bander = $2 AND relations.id_host = $2)
        `, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Error obteniendo relación:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const confirmRelation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE relations SET confirmed = true WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }
        res.status(200).json({ message: 'Relación confirmada', relation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
        }
        const result = await pool.query(
            `SELECT id, name, surname, mail FROM users WHERE name LIKE $1 OR surname LIKE $1 OR mail LIKE $1`,
            [q + '%']
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
