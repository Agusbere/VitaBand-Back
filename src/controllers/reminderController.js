import createGenericController from './genericController.js';

export const reminder = createGenericController({
    table: 'reminder',
    insertFields: ['title', 'description', 'id_color', 'repetition', 'confirmed', 'id_medication', 'hour', 'min'],
    updateFields: ['title', 'description', 'id_color', 'repetition', 'confirmed', 'id_medication', 'hour', 'min'],
    label: 'recordatorio'
});
