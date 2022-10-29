module.exports = class {
    constructor(bankAccountRepository, cryptoProvider, bankAccountDataProvider) {
        this.bankAccountRepository = bankAccountRepository;
        this.cryptoProvider = cryptoProvider;
        this.bankAccountDataProvider = bankAccountDataProvider;
    }

    async execute({ bank = 'SANDBOX', userId, credentials }) {
        switch (bank) {
            default:
                return this.connectToSandbox(bank, userId, credentials);
        }
    }

    async connectToSandbox(bank, userId, credentials) {
        const connector = await this.bankAccountDataProvider.getSandboxConnector(bank, credentials);
        const account = await this.bankAccountRepository.save({
            userId,
            connector: this.cryptoProvider.encrypt(connector),
        });
        return account;
    }
};
