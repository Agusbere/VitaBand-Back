import createGenericController from './genericController.js';

export const relations = createGenericController({
    table: 'relations',
    insertFields: ['id_bander', 'id_host', 'id_rels'],
    updateFields: ['id_bander', 'id_host', 'id_rels'],
    label: 'relación'
});
