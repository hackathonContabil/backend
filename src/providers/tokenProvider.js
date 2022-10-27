const { sign, verify } = require('jsonwebtoken');

module.exports = class TokenProvider {
    tokenSecret = process.env.TOKEN_SECRET;
    tokenExpires = process.env.TOKEN_EXPIRES_TIME_IN_HOURS;

    create(tokenInfo) {
        const hourInTimeSpanFormat = this.tokenExpires + 'h';
        return sign(tokenInfo, this.tokenSecret, { expiresIn: hourInTimeSpanFormat });
    }

    getInfoIfTokenIsValid(token) {
        try {
            const tokenInfo = verify(token, this.tokenSecret);
            return tokenInfo;
        } catch {
            return;
        }
    }
};
