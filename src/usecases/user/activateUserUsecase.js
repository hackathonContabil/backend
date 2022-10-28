const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user || !user.isEmailConfirmed || user.isActive) {
            throw new BadRequestError('invalid-credentials');
        }
        await this.userRepository.activate(user.id);
    }
};
