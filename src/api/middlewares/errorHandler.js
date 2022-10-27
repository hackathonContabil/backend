const messages = require('../../errors/messages');
const BadRequestError = require('../../errors/badRequestError');
const UnauthorizedError = require('../../errors/unauthorizedError');

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
