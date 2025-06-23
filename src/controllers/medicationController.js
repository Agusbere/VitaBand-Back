import createGenericController from './genericController.js';
import pool from '../database/connection.js';

export const medication = createGenericController({
    table: 'medication',
    insertFields: ['id_user', 'start', 'finish', 'frequency', 'id_meds'],
    updateFields: ['id_user', 'start', 'finish', 'frequency', 'id_meds'],
    label: 'medicación'
});

export const getMedicationByIdWithUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT 
        medication.*,
        users.name AS user_name,
        users.mail AS user_email,
        users.birthdate,
        users.phone
      FROM medication
      INNER JOIN users ON users.id = medication.id_user
      WHERE medication.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medicación no encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener medicación con usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
