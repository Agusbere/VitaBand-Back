import pool from '../database/connection.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = '@VitaBand_10';

export const register = async (req, res) => {
    const { mail, password, phone } = req.body;

    if (!mail || !password || !phone) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const existing = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (mail, password, phone, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [mail, hashedPassword, phone]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente', user: result.rows[0] });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const login = async (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(400).json({ error: 'Mail y contraseña son obligatorios' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, mail: user.mail },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token, user: { id: user.id, mail: user.mail } });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
