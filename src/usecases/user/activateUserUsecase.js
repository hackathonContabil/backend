const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user || user.isActive || !user.isEmailConfirmed) {
            throw new BadRequestError('invalid-credentials');
        }
        await this.userRepository.activate(user.id);
    }
};
