const { verify } = require('jsonwebtoken');
const UserRepository = require('../../repository/userRepository');
const UnauthorizedError = require('../../error/unauthorizedError');

module.exports = async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new UnauthorizedError('invalid-credentials');
    }

    const id = getUserIdFromAuthHeader(authHeader);
    const user = await findUserById(id);

    req.user = user;
    next();
};

function getUserIdFromAuthHeader(authHeader) {
    const [_, tokenWithoutBearerPrefix] = authHeader.split(' ');
    try {
        const { id } = verify(tokenWithoutBearerPrefix, process.env.TOKEN_SECRET);
        return id;
    } catch {
        throw new UnauthorizedError('invalid-credentials');
    }
}

async function findUserById(id) {
    const userRepository = new UserRepository();
    const user = await userRepository.findById(id);
    if (!user) {
        throw new UnauthorizedError('invalid-credentials');
    }
    delete user.password;
    return user;
}
