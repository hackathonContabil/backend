const BadRequestError = require('../../errors/badRequestError');

module.exports = class AuthenticateUserUsecase {
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

        const passwordIsValid = this.cryptoProvider.compareHash(password, user.password);
        if (!passwordIsValid) {
            throw new BadRequestError('invalid-credentials');
        }
        const token = this.tokenProvider.create({
            id: user.id,
            email,
            isAdmin: user.isAdmin,
            isAccountant: user.isAccountant,
            isSharingBankAccountData: user.isSharingBankAccountData,
        });
        return {
            token,
            isAdmin: user.isAdmin,
            isAccountant: user.isAccountant,
            isSharingBankAccountData: user.isSharingBankAccountData,
        };
    }
};
