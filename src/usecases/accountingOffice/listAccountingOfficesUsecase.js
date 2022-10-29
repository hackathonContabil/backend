module.exports = class {
    constructor(accountingOfficeRepository, cryptoProvider) {
        this.accountingOfficeRepository = accountingOfficeRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ page, limit, filter }) {
        const { rows: offices, count } = await this.accountingOfficeRepository.list(
            page,
            limit,
            filter,
            filter ? this.cryptoProvider.encrypt(filter) : null
        );
        return { count, offices: this.decryptData(offices) };
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
