module.exports = class ListUsersUsecase {
    constructor(userRepository, cryptoProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ page, limit, filter }, { decrypt = true }) {
        const { total, users } = await this.userRepository.list(
            page,
            limit,
            filter && this.cryptoProvider.encrypt(filter)
        );
        return {
            total,
            users: !decrypt ? users : this.decryptUserData(users),
        };
    }

    decryptUserData(users) {
        return users.map(({ email, document, ...userData }) => {
            const decryptedEmail = this.cryptoProvider.decrypt(email);
            const decryptedDocument = this.cryptoProvider.decrypt(document);
            return {
                ...userData,
                email: decryptedEmail,
                document: decryptedDocument,
            };
        });
    }
};
