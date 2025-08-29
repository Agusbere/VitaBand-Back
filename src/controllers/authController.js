
import pool from '../database/connection.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET || '@VitaBand_10';

export const register = async (req, res) => {
    const { mail, password, phone } = req.body;

    if (!mail || !password || !phone) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: getReasonPhrase(StatusCodes.BAD_REQUEST) });
    }

    try {
        const existing = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
        if (existing.rows.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({ error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (mail, password, phone, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, mail, phone`,
            [mail, hashedPassword, phone]
        );

        const user = result.rows[0];
        
        // Generar token para el nuevo usuario
        const token = jwt.sign(
            { id: user.id, mail: user.mail },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(StatusCodes.CREATED).json({ 
            message: 'Usuario registrado correctamente', 
            user: { id: user.id, mail: user.mail },
            token 
        });
    } catch (err) {
        console.error('Error en registro:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const login = async (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Mail y contraseña son obligatorios' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
        const user = result.rows[0];

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
        }

        await pool.query('UPDATE users SET last_sign_in = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, mail: user.mail },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // No devolver información sensible
        const { password: _, ...userWithoutPassword } = user;

        res.status(StatusCodes.OK).json({ 
            token, 
            user: { 
                id: user.id, 
                mail: user.mail,
                name: user.name,
                surname: user.surname 
            } 
        });
    } catch (err) {
        console.error('Error en login:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const verifyToken = async (req, res) => {
    try {
        // El middleware ya verificó el token, solo devolvemos la info del usuario
        const result = await pool.query(
            'SELECT id, mail, name, surname, phone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Usuario no encontrado' });
        }

    res.status(StatusCodes.OK).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error en verificación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

export const getTokenByUserId = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('SELECT id, mail FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, mail: user.mail },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

    res.status(StatusCodes.OK).json({ token });
    } catch (err) {
        console.error('Error obteniendo token:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};
