import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '@VitaBand_10';

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Header de autorización requerido' });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Error de verificación JWT:', err.message);
                return res.status(403).json({ error: 'Token inválido o expirado' });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}