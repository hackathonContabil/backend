const BadRequestError = require('../../errors/badRequestError');

module.exports = class CreateAccountingOfficeUsecase {
    constructor(accountingOfficeRepository) {
        this.accountingOfficeRepository = accountingOfficeRepository;
    }

    async execute({ name, document }) {
        const officeWithSameName = await this.accountingOfficeRepository.findByName(name);
        if (officeWithSameName) {
            throw new BadRequestError('invalid-credentials');
        }
        const office = await this.accountingOfficeRepository.save({
            name,
            document,
        });
        return office;
    }
};
