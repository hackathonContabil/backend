const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(
        accountingOfficeRepository,
        userRepository,
        cryptoProvider,
        tokenProvider,
        mailProvider
    ) {
        this.accountingOfficeRepository = accountingOfficeRepository;
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
        this.tokenProvider = tokenProvider;
        this.mailProvider = mailProvider;
    }

    async execute({
        name,
        email,
        password,
        document,
        isAdmin,
        isAccountant,
        accountantState,
        accountingOfficeId,
    }) {
        const passwordHash = this.cryptoProvider.hash(password);
        const encryptedEmail = this.cryptoProvider.encrypt(email);
        const encryptedDocument = document ? this.cryptoProvider.encrypt(document) : null;

        const [userWithSameEmail, userWithSameDocument, accountingOffice] = await Promise.all([
            this.userRepository.findByEmail(encryptedEmail),
            this.findUserByDocumentIfItExists(encryptedDocument),
            this.findAccountingOfficeByIdIfItExists(accountingOfficeId),
        ]);
        if (userWithSameEmail || userWithSameDocument || !accountingOffice) {
            throw new BadRequestError('invalid-credentials');
        }

        const user = await this.userRepository.save({
            name,
            email: encryptedEmail,
            password: passwordHash,
            document: document ? encryptedDocument : null,
            isAdmin,
            isAccountant,
            accountantState,
            accountingOfficeId,
        });
        this.sendValidationMail(email);
        return user;
    }

    async findUserByDocumentIfItExists(document) {
        if (!document) {
            return;
        }
        const user = await this.userRepository.findByDocument(document);
        return user;
    }

    async findAccountingOfficeByIdIfItExists(id) {
        if (!id) {
            return;
        }
        const office = await this.accountingOfficeRepository.findById(id);
        return office;
    }

    sendValidationMail(email) {
        const validationToken = this.tokenProvider.create({ email });
        this.mailProvider.sendActivateAccountMail(validationToken, email);
    }
};
