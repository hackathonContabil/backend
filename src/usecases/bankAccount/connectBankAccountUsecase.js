module.exports = class {
    constructor(bankAccountRepository, userRepository, cryptoProvider, bankAccountDataProvider) {
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.bankAccountDataProvider = bankAccountDataProvider;
    }

    async execute({ bank = 'SANDBOX', userId, credentials }) {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.isActive || !user.isEmailConfirmed || !user.isClient) {
            throw new BadRequestError('invalid-credentials');
        }
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
