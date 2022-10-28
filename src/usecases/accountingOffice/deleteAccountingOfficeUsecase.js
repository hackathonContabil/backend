const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(accountingOfficeRepository) {
        this.accountingOfficeRepository = accountingOfficeRepository;
    }

    async execute(id) {
        const office = await this.accountingOfficeRepository.findById(id);
        if (!office) {
            throw new BadRequestError('invalid-credentials');
        }
        await this.accountingOfficeRepository.delete(office.id);
    }
};
