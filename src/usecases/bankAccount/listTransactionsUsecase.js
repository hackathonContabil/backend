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
        const { count, transactions } = await this.transactionsRepository.list(page, limit, filter);
        const formattedTransactions = transactions.map((transaction) => {
            const formattedDate = transaction.transactionDate.toLocaleDateString();
            return {
                Data: formattedDate,
                'Tipo de Operação': transaction.description,
                'Entrada ou Saida': transaction.amount > 0 ? 'Entrada' : 'Saída',
                'CPF ou CNPJ': transaction.payerType,
                'Categoria do Pagto ou Recebimento':
                    transaction.amount > 0 ? 'Recebimentos' : 'Pagamento',
                'Descrição do realizador': transaction.payerName,
                Documento: transaction.payerDocument,
                'Valor da Operação': transaction.amount,
                Saldo: transaction.balance,
            };
        });
        return { count, transactions: formattedTransactions };
    }
};
