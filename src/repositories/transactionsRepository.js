const Transactions = require('../models/transactions');

module.exports = class {
    async saveBatch(data) {
        await Transactions.bulkCreate(data);
    }
};
