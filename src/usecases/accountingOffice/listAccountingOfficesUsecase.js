module.exports = class {
    constructor(accountingOfficeRepository) {
        this.accountingOfficeRepository = accountingOfficeRepository;
    }

    async execute() {
        const offices = await this.accountingOfficeRepository.findAll();
        return offices;
    }
};
