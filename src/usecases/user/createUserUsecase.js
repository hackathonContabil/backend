const BadRequestError = require('../../errors/badRequestError');

module.exports = class CreateUserUsecase {
    constructor(userRepository, cryptoProvider, tokenProvider, mailProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
        this.mailProvider = mailProvider;
    }

    async execute({ name, email, password, document }) {
        const passwordHash = this.cryptoProvider.hash(password);
        const encryptedEmail = this.cryptoProvider.encrypt(email);
        const encryptedDocument = this.cryptoProvider.encrypt(document);

        const [userWithSameEmail, userWithSameDocument] = await Promise.all([
            this.userRepository.findByEmail(encryptedEmail),
            this.userRepository.findByDocument(encryptedDocument),
        ]);
        if (userWithSameEmail || userWithSameDocument) {
            throw new BadRequestError('invalid-credentials');
        }

        const user = await this.userRepository.save({
            name,
            email: encryptedEmail,
            password: passwordHash,
            document: encryptedDocument,
        });
        this.sendValidationMail(email);
        return user;
    }

    sendValidationMail(email) {
        const validationToken = this.tokenProvider.create({ email });
        this.mailProvider.sendValidationMail(validationToken, email);
    }
};
