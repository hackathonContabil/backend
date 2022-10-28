const AccountingOffice = require('../models/accountingOffice');

module.exports = class BankAccountConnectorRepository {
    async save(userInfo) {
        const user = await AccountingOffice.create(userInfo);
        return user.get({ plain: true });
    }

    async findByName(name) {
        const user = await AccountingOffice.findOne({ where: { name } }, { raw: true });
        return user;
    }
};
