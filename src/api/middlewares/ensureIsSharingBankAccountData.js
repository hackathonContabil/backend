const UnauthorizedError = require('../../errors/unauthorizedError');

module.exports = (req, _res, next) => {
    if (!req.user.isSharingBankAccountData) {
        throw new UnauthorizedError('is-not-sharing-bank-account-data');
    }
    next();
};
