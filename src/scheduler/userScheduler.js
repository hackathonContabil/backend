const schedule = require('node-schedule');

module.exports = class {
    constructor(deleteExpiredUsersWithNonConfirmedEmailUsecase) {
        this.deleteExpiredUsersWithNonConfirmedEmailUsecase =
            deleteExpiredUsersWithNonConfirmedEmailUsecase;
    }

    init() {
        schedule.scheduleJob('* */1 * * * *', () => {
            try {
                this.deleteExpiredUsersWithNonConfirmedEmailUsecase.execute();
            } catch (error) {
                console.log(error);
            }
        });
    }
};
