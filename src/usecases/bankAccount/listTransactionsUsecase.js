const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(transactionsRepository, userRepository) {
        this.transactionsRepository = transactionsRepository;
        this.userRepository = userRepository;
    }

    async execute({ page, limit, filter }) {
        if (filter.isAccountant) {
            const user = await this.userRepository.findById(filter.userId);
            if (
                !user ||
                !user.isActive ||
                !user.isClient ||
                user.accountingOfficeId !== filter.accountingOfficeId
            ) {
                throw new BadRequestError('invalid-credentials');
            }
        }
        const transactions = await this.transactionsRepository.list(page, limit, filter);
        return transactions;
    }
};
