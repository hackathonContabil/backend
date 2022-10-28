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
        phone,
        email,
        password,
        document,
        isAdmin,
        isClient,
        isAccountant,
        accountantState,
        accountingOfficeId,
    }) {
        const passwordHash = this.cryptoProvider.hash(password);
        const encryptedEmail = this.cryptoProvider.encrypt(email);
        const encryptedPhone = phone ? this.cryptoProvider.encrypt(phone) : null;
        const encryptedDocument = document ? this.cryptoProvider.encrypt(document) : null;

        const [userWithSameEmail, userWithSamePhone, userWithSameDocument, accountingOffice] =
            await Promise.all([
                this.userRepository.findByEmail(encryptedEmail),
                this.findUserByPhoneIfItExists(encryptedPhone),
                this.findUserByDocumentIfItExists(encryptedDocument),
                this.findAccountingOfficeByIdIfItExists(accountingOfficeId),
            ]);
        if (userWithSameEmail || userWithSamePhone || userWithSameDocument || !accountingOffice) {
            throw new BadRequestError('invalid-credentials');
        }

        const user = await this.userRepository.save({
            name,
            phone: encryptedPhone,
            email: encryptedEmail,
            password: passwordHash,
            document: document ? encryptedDocument : null,
            isAdmin,
            isClient,
            isAccountant,
            accountantState,
            accountingOfficeId,
        });
        this.sendValidationMail(email);
        return user;
    }

    async findUserByPhoneIfItExists(phone) {
        if (!phone) {
            return;
        }
        const user = await this.userRepository.findByPhone(phone);
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
