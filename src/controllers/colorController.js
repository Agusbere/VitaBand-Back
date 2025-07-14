import createGenericController from './genericController.js';

export const color = createGenericController({
    table: 'color',
    insertFields: ['name', 'hexa'],
    updateFields: ['name', 'hexa'],
    label: 'color'
});