const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(userRepository, cryptoProvider, tokenProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
    }

    async execute({ email, password }) {
        const encryptedEmail = this.cryptoProvider.encrypt(email);
        const user = await this.userRepository.findByEmail(encryptedEmail);
        if (!user || !user.isActive) {
            throw new BadRequestError('invalid-credentials');
        }

        const isPasswordValid = this.cryptoProvider.compareHash(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('invalid-credentials');
        }

        const common = {
            isAdmin: user.isAdmin,
            isAccountant: user.isAccountant,
            isSharingBankAccountData: user.isSharingBankAccountData,
        };
        const token = this.tokenProvider.create({ id: user.id, email, ...common });
        return { token, ...common };
    }
};
