import createGenericController from './genericController.js';

export const gender = createGenericController({
    table: 'gender',
    insertFields: ['name'],
    updateFields: ['name'],
    label: 'género'
});
