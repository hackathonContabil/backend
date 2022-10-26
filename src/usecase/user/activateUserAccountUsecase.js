const BadRequestError = require('../../error/badRequestError');

module.exports = class ActivateUserAccountUsecase {
    constructor(userRepository, cryptoProvider, tokenProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
    }

    async execute(token) {
        const tokenData = this.tokenProvider.getInfoIfTokenIsValid(token);
        if (!tokenData) {
            throw new BadRequestError('invalid-token');
        }

        const email = this.cryptoProvider.encrypt(tokenData.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.isActive) {
            throw new BadRequestError('invalid-token');
        }
        await this.userRepository.active(user.id);
    }
};
