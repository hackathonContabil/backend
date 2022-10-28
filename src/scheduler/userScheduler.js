const schedule = require('node-schedule');

module.exports = class {
    constructor(deleteExpiredUsersWithNonConfirmedEmailUsecase) {
        this.deleteExpiredUsersWithNonConfirmedEmailUsecase =
            deleteExpiredUsersWithNonConfirmedEmailUsecase;
    }

    init() {
        schedule.scheduleJob('* 1 * * * *', () => {
            this.deleteExpiredUsersWithNonConfirmedEmailUsecase.execute();
        });
    }
};
