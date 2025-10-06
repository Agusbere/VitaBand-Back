import pool from '../database/connection.js';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const createRelation = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { target_user_id, id_rels} = req.body;

        if (!target_user_id || !id_rels) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }

        if (currentUserId === parseInt(target_user_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No puedes crear una relación contigo mismo' });
        }

        const usersQuery = await pool.query(
            'SELECT id, name FROM users WHERE id IN ($1, $2)',
            [currentUserId, target_user_id]
        );

        if (usersQuery.rows.length !== 2) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Usuario no encontrado' });
        }

        const currentUser = usersQuery.rows.find(user => user.id == currentUserId);
        const targetUser = usersQuery.rows.find(user => user.id == target_user_id);

        const existingRelation = await pool.query(
            'SELECT id FROM relations WHERE id_bander = $1 AND id_host = $2',
            [target_user_id, currentUserId]
        );
        if (existingRelation.rows.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({ error: getReasonPhrase(StatusCodes.CONFLICT) });
        }

        const result = await pool.query(
            'INSERT INTO relations (id_bander, id_host, id_rels, confirmed) VALUES ($1, $2, $3, $4) RETURNING *',
            [target_user_id, currentUserId, id_rels, false]
        );

        res.status(StatusCodes.CREATED).json({
            message: 'Relación creada exitosamente',
            relation: result.rows[0]
        });
    } catch (err) {
        console.error('Error creando relación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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

    res.status(StatusCodes.OK).json(result.rows);

    } catch (err) {
        console.error('Error obteniendo relaciones:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Relación no encontrada' });
        }

        res.status(StatusCodes.OK).json({ message: 'Relación eliminada exitosamente' });

    } catch (err) {
        console.error('Error eliminando relación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Relación no encontrada' });
        }

    res.status(StatusCodes.OK).json(result.rows[0]);

    } catch (err) {
        console.error('Error obteniendo relación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const confirmRelation = async (req, res) => {
    try {
        const id_bander = req.user.id;
        const { id_host } = req.body;

        if (!id_host) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Falta el parámetro: id_host es requerido' });
        }

        const relationCheck = await pool.query(
            'SELECT * FROM relations WHERE id_bander = $1 AND id_host = $2',
            [id_bander, id_host]
        );

        if (relationCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Relación no encontrada entre estos usuarios' });
        }

        const result = await pool.query(
            'UPDATE relations SET confirmed = true WHERE id_bander = $1 AND id_host = $2 RETURNING *',
            [id_bander, id_host]
        );

        res.status(StatusCodes.OK).json({ 
            message: 'Relación confirmada exitosamente', 
            relation: result.rows[0] 
        });
    } catch (err) {
        console.error('Error confirmando relación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

// export const unconfirmRelation = async (req, res) => {
//     try {
//         const id_bander = req.user.id;
//         const { id_host } = req.body;

//         if (!id_host) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Falta el parámetro: id_host es requerido' });
//         }

//         const relationCheck = await pool.query(
//             'SELECT * FROM relations WHERE id_bander = $1 AND id_host = $2',
//             [id_bander, id_host]
//         );

//         if (relationCheck.rows.length === 0) {
//             return res.status(StatusCodes.NOT_FOUND).json({ error: 'Relación no encontrada entre estos usuarios' });
//         }

//         const result = await pool.query(
//             'UPDATE relations SET confirmed = false WHERE id_bander = $1 AND id_host = $2 RETURNING *',
//             [id_bander, id_host]
//         );

//         res.status(StatusCodes.OK).json({ 
//             message: 'Relación desconfirmada exitosamente', 
//             relation: result.rows[0] 
//         });
//     } catch (err) {
//         console.error('Error desconfirmando relación:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
//     }
// };

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Falta el parámetro de búsqueda' });
        }
        const result = await pool.query(
            `SELECT id, name, surname, mail, phone FROM users WHERE name LIKE $1 OR surname LIKE $1 OR mail LIKE $1`,
            [q + '%']
        );
    res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const getPendingInvitations = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT 
                relations.id,
                relations.id_bander,
                relations.id_host,
                relations.id_rels,
                hoster.name,
                hoster.mail,
                rels.name
            FROM relations
            JOIN users hoster ON relations.id_host = hoster.id
            LEFT JOIN rels ON relations.id_rels = rels.id
            WHERE relations.id_bander = $1 AND relations.confirmed = false
            ORDER BY relations.id DESC
        `, [userId]);

        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        console.error('Error obteniendo invitaciones pendientes:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const confirmAllInvitations = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'UPDATE relations SET confirmed = true WHERE id_bander = $1 AND confirmed = false RETURNING *',
            [userId]
        );

        res.status(StatusCodes.OK).json({ 
            message: `${result.rows.length} invitaciones confirmadas exitosamente`, 
            relations: result.rows 
        });
    } catch (err) {
        console.error('Error confirmando todas las invitaciones:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const getConfirmedAsHost = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT 
                relations.id,
                relations.id_bander,
                relations.id_host,
                relations.id_rels,
                bander.name,
                bander.mail,
                rels.name
            FROM relations
            JOIN users bander ON relations.id_bander = bander.id
            LEFT JOIN rels ON relations.id_rels = rels.id
            WHERE relations.id_host = $1 AND relations.confirmed = true
            ORDER BY relations.id DESC
        `, [userId]);

        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        console.error('Error obteniendo relaciones confirmadas como host:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const denyRelation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id_host } = req.body;

        if (!id_host) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Falta el parámetro: id_host es requerido' });
        }

        const result = await pool.query(
            'DELETE FROM relations WHERE id_bander = $1 AND id_host = $2 AND confirmed = false RETURNING *',
            [userId, id_host]
        );

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invitación no encontrada o ya confirmada' });
        }

        res.status(StatusCodes.OK).json({ 
            message: 'Invitación rechazada exitosamente',
            relation: result.rows[0]
        });

    } catch (err) {
        console.error('Error rechazando invitación:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const searchConfirmedUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { q } = req.query;
        
        if (!q) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Falta el parámetro de búsqueda' });
        }

        const result = await pool.query(`
            SELECT 
                users.id,
                users.name,
                users.surname,
                users.mail,
                users.phone,
                relations.id_rels,
                rels.name
            FROM relations
            JOIN users ON relations.id_bander = users.id
            LEFT JOIN rels ON relations.id_rels = rels.id
            WHERE relations.id_host = $1 
            AND relations.confirmed = true
            AND (users.name LIKE $2 OR users.surname LIKE $2 OR users.mail LIKE $2)
            ORDER BY users.name
        `, [userId, q + '%']);

        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        console.error('Error buscando usuarios confirmados:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};
