const { Op } = require('sequelize');
const User = require('../models/user');

module.exports = class {
    async save(data) {
        const user = await User.create(data);
        return user.get({ plain: true });
    }

    async findById(id) {
        const user = await User.findOne({ where: { id }, raw: true });
        return user;
    }

    async findByPhone(phone) {
        const user = await User.findOne({ where: { phone }, raw: true });
        return user;
    }

    async findByEmail(email) {
        const user = await User.findOne({ where: { email }, raw: true });
        return user;
    }

    async findByDocument(document) {
        const user = await User.findOne({ where: { document }, raw: true });
        return user;
    }

    async findByAccountantLicense(accountantLicense) {
        const user = await User.findOne({ where: { accountantLicense }, raw: true });
        return user;
    }

    async activate(id) {
        const user = await User.update(
            { isActive: true, activatedAt: new Date() },
            { where: { id } }
        );
        return user;
    }

    async confirmEmail(id) {
        const user = await User.update(
            { isEmailConfirmed: true, emailConfirmedAt: new Date() },
            { where: { id } }
        );
        return user;
    }

    async shareBankAccountData(id) {
        const user = await User.update(
            { isSharingBankAccountData: true, acceptedShareBankAccountDataAt: new Date() },
            { where: { id } }
        );
        return user;
    }

    async deleteUsersWithNonConfirmedEmail(expiresDate) {
        await User.destroy({
            where: {
                isEmailConfirmed: false,
                createdAt: { [Op.lt]: expiresDate },
            },
        });
    }

    async list(page = 0, limit, nameFilter, emailOrDocumentFilter, accountingOfficeId) {
        const filters = {};
        if (nameFilter && accountingOfficeId) {
            filters[Op.or] = [
                { name: { [Op.like]: `%${nameFilter.toUpperCase()}%` } },
                { email: { [Op.like]: `%${emailOrDocumentFilter.toUpperCase()}%` } },
                { document: { [Op.like]: `%${emailOrDocumentFilter.toUpperCase()}%` } },
            ];
            filters['isClient'] = true;
            filters['accountingOfficeId'] = accountingOfficeId;
        } else if (nameFilter) {
            filters[Op.or] = [
                { name: { [Op.like]: `%${nameFilter.toUpperCase()}%` } },
                { email: { [Op.like]: `%${emailOrDocumentFilter.toUpperCase()}%` } },
                { document: { [Op.like]: `%${emailOrDocumentFilter.toUpperCase()}%` } },
            ];
        } else if (accountingOfficeId) {
            filters['isClient'] = true;
            filters['accountingOfficeId'] = accountingOfficeId;
        }
        const { count: total, rows: users } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit,
            include: 'AccountingOffice',
            offset: (limit || 0) * page,
            order: [
                ['isAdmin', 'DESC'],
                ['isActive', 'DESC'],
                ['name', 'DESC'],
                ['createdAt', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
            raw: true,
            where: filters,
        });
        return { total, users };
    }
};
