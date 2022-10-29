module.exports = class {
    constructor(userRepository, cryptoProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ page, limit, filter, isAccountant, accountingOfficeId }) {
        const { total, users } = await this.userRepository.list(
            page,
            limit,
            filter,
            filter ? this.cryptoProvider.encrypt(filter) : null,
            isAccountant ? accountingOfficeId : null
        );
        return { total, users: this.decryptData(users) };
    }

    decryptData(users) {
        return users.map(({ phone, email, document, accountantLicense, ...data }) => {
            const formattedData = {
                ...data,
                phone: phone ? this.cryptoProvider.decrypt(phone) : null,
                email: this.cryptoProvider.decrypt(email),
                document: document ? this.cryptoProvider.decrypt(document) : null,
                accountantLicense: accountantLicense
                    ? this.cryptoProvider.decrypt(accountantLicense)
                    : null,
                accountingOfficeName: data['AccountingOffice.name'],
            };
            delete formattedData['AccountingOffice.id'];
            delete formattedData['AccountingOffice.name'];
            delete formattedData['AccountingOffice.document'];
            delete formattedData['AccountingOffice.createdAt'];
            delete formattedData['AccountingOffice.updatedAt'];
            return formattedData;
        });
    }
};
