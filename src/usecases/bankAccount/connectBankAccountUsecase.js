module.exports = class ConnectBankAccountUsecase {
    constructor(bankAccountRepository, cryptoProvider, bankAccountDataProvider) {
        this.bankAccountRepository = bankAccountRepository;
        this.cryptoProvider = cryptoProvider;
        this.bankAccountDataProvider = bankAccountDataProvider;
    }

    async execute({ bank = 'SANDBOX', userId, credentials }) {
        switch (bank) {
            default:
                return this.connectToSandboxBankAccount(bank, userId, credentials);
        }
    }

    async connectToSandboxBankAccount(bank, userId, credentials) {
        const accountConnectionId =
            await this.bankAccountDataProvider.createSandboxAccountConnectionId(bank, credentials);
        const bankAccount = await this.bankAccountRepository.save({
            userId,
            connector: this.cryptoProvider.encrypt(accountConnectionId),
        });
        return bankAccount;
    }
};
