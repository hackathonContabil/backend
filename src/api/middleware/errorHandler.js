const messages = require('../../error/messages');
const BadRequestError = require('../../error/badRequestError');
const UnauthorizedError = require('../../error/unauthorizedError');

module.exports = (error, _req, res, _next) => {
    if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
        return res
            .status(error.status)
            .json({ status: 'error', messages: [messages[error.message].message] });
    }

    console.log(error);

    return res
        .status(messages.internal.status)
        .json({ status: 'error', messages: [messages.internal.message] });
};
