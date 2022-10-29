const { Op } = require('sequelize');
const AccountingOffice = require('../models/accountingOffice');

module.exports = class {
    async save(data) {
        const office = await AccountingOffice.create(data);
        return office.get({ plain: true });
    }

    async list(page = 0, limit, nameFilter, documentFilter) {
        const offices = await AccountingOffice.findAndCountAll({
            limit,
            offset: (limit || 0) * page,
            order: [
                ['name', 'DESC'],
                ['createdAt', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
            raw: true,
            where: nameFilter && {
                [Op.or]: [
                    { name: { [Op.like]: `${nameFilter}` } },
                    { document: { [Op.like]: `${documentFilter}` } },
                ],
            },
        });
        return offices;
    }

    async findById(id) {
        const office = await AccountingOffice.findOne({ where: { id } }, { raw: true });
        return office;
    }

    async findByName(name) {
        const office = await AccountingOffice.findOne({ where: { name } }, { raw: true });
        return office;
    }

    async findByDocument(document) {
        const office = await AccountingOffice.findOne({ where: { document } }, { raw: true });
        return office;
    }

    async delete(id) {
        await AccountingOffice.destroy({ where: { id } });
    }
};
