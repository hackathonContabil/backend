const UnauthorizedError = require('../../errors/unauthorizedError');

module.exports = (req, _res, next) => {
    if (!req.user.isAdmin) {
        throw new UnauthorizedError('invalid-credentials');
    }
    next();
};
