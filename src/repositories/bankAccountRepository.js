const BankAccountConnector = require('../models/bankAccountConnector');

module.exports = class {
    async save(data) {
        const connector = await BankAccountConnector.create(data);
        return connector.get({ plain: true });
    }

    async updateTransactionsReference(id, reference) {
        const connector = await BankAccountConnector.update(
            { transactionsReference: reference },
            { where: { id } }
        );
        return connector;
    }

    async findByNullableTransactionsReference() {
        const connectors = await BankAccountConnector.findAll({
            where: { transactionsReference: null },
            raw: true,
        });
        return connectors;
    }
};
