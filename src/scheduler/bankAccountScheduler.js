const schedule = require('node-schedule');

module.exports = class {
    constructor(fillAccountsTransactionsReferencesUsecase) {
        this.fillAccountsTransactionsReferencesUsecase = fillAccountsTransactionsReferencesUsecase;
    }

    init() {
        schedule.scheduleJob('5 * * * * *', () => {
            this.fillAccountsTransactionsReferencesUsecase.execute();
        });
    }
};
