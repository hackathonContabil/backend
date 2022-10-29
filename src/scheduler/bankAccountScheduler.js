const schedule = require('node-schedule');

module.exports = class {
    constructor(fillAccountsTransactionsReferencesUsecase) {
        this.fillAccountsTransactionsReferencesUsecase = fillAccountsTransactionsReferencesUsecase;
    }

    init() {
        schedule.scheduleJob('*/45 * * * * *', () => {
            try {
                this.fillAccountsTransactionsReferencesUsecase.execute();
            } catch (error) {
                console.log(error);
            }
        });
    }
};
