const Transactions = require('../models/transactions');

module.exports = class {
    async saveBatch(data) {
        await Transactions.bulkCreate(data);
    }

    async list(page = 0, limit, { userId, from, to }, asc = false) {
        const filters = { userId };
        if (to && from) {
            filters['transactionDate'] = { [Op.between]: [startDate, endDate] };
        } else if (from) {
            filters['transactionDate'] = { [Op.gte]: from };
        } else if (to) {
            filters['transactionDate'] = { [Op.lte]: to };
        }
        const { count: total, rows: transactions } = await Transactions.findAndCountAll({
            limit,
            offset: (limit || 0) * page,
            order: [['transactionDate', asc ? 'ASC' : 'DESC']],
            raw: true,
            where: filters,
        });
        return { total, transactions };
    }
};
