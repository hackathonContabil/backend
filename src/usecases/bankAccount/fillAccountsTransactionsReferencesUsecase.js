module.exports = class {
    constructor(bankAccountRepository, cryptoProvider, bankAccountDataProvider) {
        this.bankAccountRepository = bankAccountRepository;
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

    async updateTransactionsReference({ id, connector }) {
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
    }
};
