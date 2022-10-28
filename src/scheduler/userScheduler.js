const schedule = require('node-schedule');

module.exports = class {
    constructor(deleteExpiredNonActiveUsersUsecase) {
        this.deleteExpiredNonActiveUsersUsecase = deleteExpiredNonActiveUsersUsecase;
    }

    init() {
        schedule.scheduleJob('* 5 * * * *', () => {
            this.deleteExpiredNonActiveUsersUsecase.execute();
        });
    }
};
