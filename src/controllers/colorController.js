import createGenericController from './genericController.js';

export const color = createGenericController({
    table: 'color',
    insertFields: ['name', 'hexa'],
    updateFields: ['name', 'hexa'],
    label: 'color'
});

// export const getAllMedications = async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM medication');
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error('Error al obtener medicaciones:', error);
//         res.status(500).json({ error: 'Error interno del servidor' });
//     }
// };