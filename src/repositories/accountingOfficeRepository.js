const AccountingOffice = require('../models/accountingOffice');

module.exports = class {
    async save(data) {
        const office = await AccountingOffice.create(data);
        return office.get({ plain: true });
    }

    async findById(id) {
        const office = await AccountingOffice.findOne({ where: { id } }, { raw: true });
        return office;
    }

    async findByName(name) {
        const office = await AccountingOffice.findOne({ where: { name } }, { raw: true });
        return office;
    }
};
