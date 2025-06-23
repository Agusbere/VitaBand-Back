import createGenericController from './genericController.js';

export const rels = createGenericController({
    table: 'rels',
    insertFields: ['name'],
    updateFields: ['name'],
    label: 'tipo de relación'
});
