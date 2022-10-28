const BankAccountConnector = require('../models/bankAccountConnector');

module.exports = class {
    async save(data) {
        const connector = await BankAccountConnector.create(data);
        return connector.get({ plain: true });
    }
};
