const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(userRepository, cryptoProvider, tokenProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
    }

    async execute(token) {
        const tokenData = this.tokenProvider.getDataIfIsValid(token);
        if (!tokenData) {
            throw new BadRequestError('invalid-token');
        }

        const email = this.cryptoProvider.encrypt(tokenData.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.isEmailConfirmed) {
            throw new BadRequestError('invalid-token');
        }
        await this.userRepository.confirmEmail(user.id);
    }
};
