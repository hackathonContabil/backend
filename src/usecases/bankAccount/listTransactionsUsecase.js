const BadRequestError = require('../../errors/badRequestError');
const { formatDate } = require('../../helper');

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
        const { count, transactions } = await this.transactionsRepository.list(page, limit, filter);
        const formattedTransactions = transactions.map((transaction) => {
            const formattedDate = formatDate(transaction.transactionDate);
            return {
                id: transaction.id,
                date: formattedDate,
                operationType: transaction.description,
                inOrOut: transaction.amount > 0 ? 'Entrada' : 'Saída',
                payerType: transaction.payerType,
                category: transaction.amount > 0 ? 'Recebimentos' : 'Pagamento',
                payerName: transaction.payerName,
                payerDocument: transaction.payerDocument,
                amount: transaction.amount,
                balance: transaction.balance,
            };
        });
        return { count, transactions: formattedTransactions };
    }
};
