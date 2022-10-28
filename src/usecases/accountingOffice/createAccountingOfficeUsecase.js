const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(accountingOfficeRepository, cryptoProvider) {
        this.accountingOfficeRepository = accountingOfficeRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ name, document }) {
        const encryptedDocument = this.cryptoProvider.encrypt(document);
        const [officeWithSameName, officeWithSameDocument] = await Promise.all([
            this.accountingOfficeRepository.findByName(name),
            this.accountingOfficeRepository.findByDocument(encryptedDocument),
        ]);
        if (officeWithSameName || officeWithSameDocument) {
            throw new BadRequestError('invalid-credentials');
        }
        const office = await this.accountingOfficeRepository.save({
            name,
            encryptedDocument,
        });
        return office;
    }
};
