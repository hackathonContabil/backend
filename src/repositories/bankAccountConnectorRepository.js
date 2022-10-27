const BankAccountConnector = require('../models/bankAccountConnector');

module.exports = class BankAccountConnectorRepository {
    async save(connectorInfo) {
        const connector = await BankAccountConnector.create(connectorInfo);
        return connector.get({ plain: true });
    }
};
