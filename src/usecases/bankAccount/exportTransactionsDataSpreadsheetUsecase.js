const { formatDate, formatNumber } = require('../../helper');

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
                return this.spreadsheetProvider.bankingReconciliationSpreadsheet(data);
            case 'cash-flow':
                data = await this.cashFlow({ userId, from, to });
                return this.spreadsheetProvider.cashFlowSpreadsheet(data);
        }
    }

    async bankingReconciliation(filter) {
        const { transactions } = await this.transactionsRepository.list(
            undefined,
            undefined,
            filter,
            true
        );
        return transactions.map((transaction) => {
            const formattedDate = formatDate(transaction.transactionDate);
            return {
                Data: formattedDate,
                'Tipo de Operação': transaction.description,
                'Entrada ou Saida': transaction.amount > 0 ? 'Entrada' : 'Saída',
                'CPF ou CNPJ': transaction.payerType,
                'Categoria do Pagto ou Recebimento':
                    transaction.amount > 0 ? 'Recebimentos' : 'Pagamento',
                'Descrição do realizador': transaction.payerName,
                Documento: transaction.payerDocument,
                'Valor da Operação': formatNumber(transaction.amount),
                Saldo: formatNumber(transaction.balance),
            };
        });
    }

    async cashFlow(filter) {
        const { transactions } = await this.transactionsRepository.list(
            undefined,
            undefined,
            filter,
            true
        );
        const transactionsPerDay = {};

        transactions.forEach((transaction) => {
            const formattedDate = formatDate(transaction.transactionDate);
            const dateAndTypeKey = `${formattedDate}-${transaction.description}`;
            if (!transactionsPerDay[dateAndTypeKey]) {
                transactionsPerDay[dateAndTypeKey] = [transaction.amount];
            } else {
                transactionsPerDay[dateAndTypeKey].push(transaction.amount);
            }
        });
        let smIn = 0;
        let smOut = 0;
        const data = [];
        for (const dateAndTypeKey in transactionsPerDay) {
            let currentLine = {};
            const transactions = transactionsPerDay[dateAndTypeKey];
            for (const transaction of transactions) {
                const [date, type] = dateAndTypeKey.split('-');
                if (transaction > 0) {
                    currentLine['Data Entrada'] = date;
                    currentLine['Descrição Entrada'] = type;
                    currentLine['Valor de Entrada'] = formatNumber(transaction);
                    smIn += transaction;
                } else {
                    currentLine['Data Saída'] = date;
                    currentLine['Descrição Saída'] = type;
                    currentLine['Valor de Saída'] = formatNumber(transaction);
                    smOut += transaction;
                }
                data.push(currentLine);
            }
        }
        data.push({
            ['Data Entrada']: 'TOTAL',
            ['Valor de Saída']: formatNumber(smOut),
            ['Valor de Entrada']: formatNumber(smIn),
        });
        data.push({
            ['Descrição Saída']: 'Saldo Final em Caixa',
            ['Valor de Saída']: formatNumber(smIn + smOut),
        });
        return data;
    }
};
