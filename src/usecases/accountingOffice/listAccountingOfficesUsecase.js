module.exports = class {
    constructor(accountingOfficeRepository, cryptoProvider) {
        this.accountingOfficeRepository = accountingOfficeRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ page, limit, filter }) {
        const offices = await this.accountingOfficeRepository.list(
            page,
            limit,
            filter ? this.cryptoProvider.encrypt(filter) : null
        );
        return this.decryptData(offices);
    }

    decryptData(offices) {
        return offices.map(({ document, ...data }) => {
            return {
                ...data,
                document: this.cryptoProvider.decrypt(document),
            };
        });
    }
};
