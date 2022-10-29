const UnauthorizedError = require('../../errors/unauthorizedError');

module.exports = (req, _res, next) => {
    if (!req.user.isAdmin && !req.user.isAccountant) {
        throw new UnauthorizedError('invalid-credentials');
    }
    next();
};
