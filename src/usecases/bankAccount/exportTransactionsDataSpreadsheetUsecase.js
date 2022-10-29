module.exports = class {
    constructor(transactionsRepository, userRepository, tokenProvider, spreadsheetProvider) {
        this.transactionsRepository = transactionsRepository;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.spreadsheetProvider = spreadsheetProvider;
    }

    async execute({ type, from, to, userId, accountingOfficeId }) {
        const user = await this.userRepository.findById(userId);
        if (user.isClient && user.accountingOfficeId !== accountingOfficeId) {
            throw new BadRequestError('invalid-credentials');
        }
        let data = [];
        switch (type) {
            case 'banking-reconciliation':
                data = await this.bankingReconciliation({ userId, from, to });
        }
        const spreadsheet = this.spreadsheetProvider.bankingReconciliationSpreadsheet(data);
        return spreadsheet;
    }

    async bankingReconciliation(filter) {
        const { transactions } = await this.transactionsRepository.list(
            undefined,
            undefined,
            filter
        );
        return transactions.map((transaction) => {
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
    }
};
