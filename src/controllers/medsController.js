import createGenericController from './genericController.js';

export const meds = createGenericController({
    table: 'meds',
    insertFields: ['name'],
    updateFields: ['name'],
    label: 'medicamento'
});
