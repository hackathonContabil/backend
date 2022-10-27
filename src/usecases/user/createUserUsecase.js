const BadRequestError = require('../../errors/badRequestError');

module.exports = class CreateUserUsecase {
    constructor(userRepository, cryptoProvider, tokenProvider, mailProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
        this.mailProvider = mailProvider;
    }

    async execute({ name, email, password, document, isAdmin, isActive, isAccountant }) {
        const passwordHash = this.cryptoProvider.hash(password);
        const encryptedEmail = this.cryptoProvider.encrypt(email);
        const encryptedDocument = document ? this.cryptoProvider.encrypt(document) : null;

        const [userWithSameEmail, userWithSameDocument] = await Promise.all([
            this.userRepository.findByEmail(encryptedEmail),
            this.findUserByDocumentIfItsNotNull(encryptedDocument),
        ]);
        if (userWithSameEmail || userWithSameDocument) {
            throw new BadRequestError('invalid-credentials');
        }

        const user = await this.userRepository.save({
            name,
            email: encryptedEmail,
            password: passwordHash,
            document: document ? encryptedDocument : null,
            isAdmin,
            isActive,
            activatedAt: isActive ? Date.now() : null,
            isAccountant,
        });
        this.sendValidationMail(email);
        return user;
    }

    sendValidationMail(email) {
        const validationToken = this.tokenProvider.create({ email });
        this.mailProvider.sendValidationMail(validationToken, email);
    }

    async findUserByDocumentIfItsNotNull(document) {
        if (!document) {
            return;
        }
        const userWithSameDocument = await this.userRepository.findByDocument(document);
        return userWithSameDocument;
    }
};
