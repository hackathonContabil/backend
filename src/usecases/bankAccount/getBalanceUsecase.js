module.exports = class {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute(userId) {
        const { transactions } = await this.transactionsRepository.list(null, null, { userId });
        return transactions[0].balance;
    }
};
