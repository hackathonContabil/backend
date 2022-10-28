const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ id, isClient = false, isAccountant = false }) {
        const user = await this.userRepository.findById(id);
        if (
            !user ||
            user.isActive ||
            !user.isEmailConfirmed ||
            user.isClient !== isClient ||
            user.isAccountant !== isAccountant
        ) {
            throw new BadRequestError('invalid-credentials');
        }
        await this.userRepository.activate(user.id);
    }
};
