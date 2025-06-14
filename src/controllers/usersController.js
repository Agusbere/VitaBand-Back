import pool from '../database/connection.js';

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createUser = async (req, res) => {
    const { name, mail, password, surname, birthdate, phone, created_at, last_sign_in, picture, id_gender } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO users (name, mail, password, surname, birthdate, phone, created_at, last_sign_in, picture, id_gender)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [name, mail, password, surname, birthdate, phone, created_at, last_sign_in, picture, id_gender]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, mail, password, surname, birthdate, phone, created_at, last_sign_in, picture, id_gender } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET name=$1, mail=$2, password=$3, surname=$4, birthdate=$5, phone=$6, created_at=$7, last_sign_in=$8, picture=$9, id_gender=$10
             WHERE id=$11 RETURNING *`,
            [name, mail, password, surname, birthdate, phone, created_at, last_sign_in, picture, id_gender, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};