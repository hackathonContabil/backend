const schedule = require('node-schedule');

module.exports = class {
    constructor(deleteUsersWithNonConfirmedEmailUsecase) {
        this.deleteUsersWithNonConfirmedEmailUsecase = deleteUsersWithNonConfirmedEmailUsecase;
    }

    init() {
        schedule.scheduleJob('* 1 * * * *', () => {
            this.deleteUsersWithNonConfirmedEmailUsecase.execute();
        });
    }
};
