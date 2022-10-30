module.exports = class {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute(userId) {
        const { transactions } = await this.transactionsRepository.list(null, null, { userId });
        if (!transactions.length) {
            return null
        }
        return transactions[0].balance;
    }
};
