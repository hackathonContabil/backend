module.exports = class ListUsersUsecase {
    constructor(userRepository, cryptoProvider) {
        this.userRepository = userRepository;
        this.cryptoProvider = cryptoProvider;
    }

    async execute({ page, limit, filter }, { decrypt = true }) {
        const { total, users } = await this.userRepository.list(
            page,
            limit,
            filter ? this.cryptoProvider.encrypt(filter) : null
        );
        return {
            total,
            users: !decrypt ? users : this.decryptUserData(users),
        };
    }

    decryptUserData(users) {
        return users.map(({ email, document, ...userData }) => {
            return {
                ...userData,
                email: this.cryptoProvider.decrypt(email),
                document: document ? this.cryptoProvider.decrypt(document) : null,
            };
        });
    }
};
