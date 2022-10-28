const { sign, verify } = require('jsonwebtoken');

module.exports = class {
    tokenSecret = process.env.TOKEN_SECRET;
    tokenExpires = process.env.TOKEN_EXPIRES_TIME_IN_HOURS;

    create(data) {
        const hourInTimeSpanFormat = this.tokenExpires + 'h';
        return sign(data, this.tokenSecret, { expiresIn: hourInTimeSpanFormat });
    }

    getDataIfIsValid(token) {
        try {
            const data = verify(token, this.tokenSecret);
            return data;
        } catch {
            return;
        }
    }
};
