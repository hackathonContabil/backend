module.exports = class {
    constructor(
        bankAccountRepository,
        transactionsRepository,
        cryptoProvider,
        bankAccountDataProvider
    ) {
        this.bankAccountRepository = bankAccountRepository;
        this.transactionsRepository = transactionsRepository;
        this.cryptoProvider = cryptoProvider;
        this.bankAccountDataProvider = bankAccountDataProvider;
    }

    async execute() {
        const accounts = await this.bankAccountRepository.findByNullableTransactionsReference();
        const accountsToUpdate = [];
        accounts.forEach(async (account) => {
            accountsToUpdate.push(
                new Promise(async (resolve) => {
                    await this.updateTransactionsReference(account);
                    resolve();
                })
            );
        });
        await Promise.all(accountsToUpdate);
    }

    async updateTransactionsReference({ id, userId, connector }) {
        const decryptedConnector = this.cryptoProvider.decrypt(connector);
        const transactionsReference =
            await this.bankAccountDataProvider.getTransactionsReferenceByConnector(
                decryptedConnector
            );
        const encryptedTransactionsReference = this.cryptoProvider.encrypt(transactionsReference);
        await this.bankAccountRepository.updateTransactionsReference(
            id,
            encryptedTransactionsReference
        );
        await this.fillTransactions(userId, transactionsReference);
    }

    async fillTransactions(userId, transactionsReference) {
        const transactions = await this.bankAccountDataProvider.getTransactions(
            transactionsReference
        );
        const transactionsToSave = transactions.map(
            ({
                id: transactionCode,
                amount,
                balance,
                description,
                descriptionRaw,
                date: transactionDate,
                paymentData,
            }) => {
                let payerName = 'Não classificado';
                let payerType = 'Não classificado';
                let payerDocument = 'Não classificado';
                if (paymentData && paymentData.payer) {
                    if (paymentData.payer.name) {
                        payerName = paymentData.payer.name;
                    }
                    if (paymentData.payer.documentNumber) {
                        payerType = paymentData.payer.documentNumber.type;
                        payerDocument = paymentData.payer.documentNumber.value;
                    }
                }
                return {
                    userId,
                    transactionCode,
                    amount,
                    balance,
                    description,
                    descriptionRaw,
                    transactionDate,
                    payerName,
                    payerType,
                    payerDocument,
                };
            }
        );
        await this.transactionsRepository.saveBatch(transactionsToSave);
    }
};
