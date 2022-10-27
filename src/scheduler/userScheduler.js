const schedule = require('node-schedule');

module.exports = class UserScheduler {
    constructor(deleteExpiredNonActiveUsers) {
        this.deleteExpiredNonActiveUsers = deleteExpiredNonActiveUsers;
    }

    init() {
        schedule.scheduleJob('* 5 * * * *', () => {
            this.deleteExpiredNonActiveUsers.execute();
        });
    }
};
