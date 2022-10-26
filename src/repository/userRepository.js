const { Op } = require('sequelize');
const User = require('../model/user');

module.exports = class UserRepository {
    async save(userInfo) {
        const user = await User.create(userInfo);
        return user.get({ plain: true });
    }

    async findById(id) {
        const user = await User.findOne({ where: { id } }, { raw: true });
        return user;
    }

    async findByEmail(email) {
        const user = await User.findOne({ where: { email } }, { raw: true });
        return user;
    }

    async findByDocument(document) {
        const user = await User.findOne({ where: { document } }, { raw: true });
        return user;
    }

    async active(id) {
        const user = await User.update(
            { isActive: true, activatedAt: new Date() },
            { where: { id } }
        );
        return user;
    }

    async deleteExpiredNonActiveUsers(expiredDate) {
        await User.destroy({
            where: {
                isActive: false,
                createdAt: { [Op.lt]: expiredDate },
            },
        });
    }

    async list(page = 0, limit, nameEmailOrDocumentFilter) {
        const { count: total, rows: users } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit,
            offset: (limit || 0) * page,
            order: [
                ['isAdmin', 'DESC'],
                ['isActive', 'DESC'],
                ['name', 'DESC'],
                ['createdAt', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
            raw: true,
            where: nameEmailOrDocumentFilter && {
                [Op.or]: [
                    { name: nameEmailOrDocumentFilter },
                    { email: nameEmailOrDocumentFilter },
                    { document: nameEmailOrDocumentFilter },
                ],
            },
        });
        return { total, users };
    }
};
