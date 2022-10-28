module.exports = class {
    tokenExpiresTimeInHours = process.env.TOKEN_EXPIRES_TIME_IN_HOURS;

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        const now = new Date();
        const validationTokenExpiresDate = now.setHours(
            now.getHours() - this.tokenExpiresTimeInHours
        );
        await this.userRepository.deleteExpiredNonActiveUsers(validationTokenExpiresDate);
    }
};
