
import jwt from 'jsonwebtoken';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET || '@VitaBand_10';

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader.split(' ')[1];

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Error de verificación JWT:', err.message);
                return res.status(StatusCodes.FORBIDDEN).json({ error: getReasonPhrase(StatusCodes.FORBIDDEN) });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
}