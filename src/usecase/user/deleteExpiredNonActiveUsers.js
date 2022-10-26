module.exports = class DeleteExpiredNonActiveUsers {
    validationTokenExpiresTimeInHours = process.env.TOKEN_EXPIRES_TIME_IN_HOURS;

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        const currentDate = new Date();
        const validationTokenExpiresDate = currentDate.setHours(
            currentDate.getHours() - this.validationTokenExpiresTimeInHours
        );
        await this.userRepository.deleteExpiredNonActiveUsers(validationTokenExpiresDate);
    }
};
