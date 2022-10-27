const joi = require('joi');
const { messages } = require('joi-translation-pt-br');

function validate(entry) {
    return (req, res, next) => {
        const errorMessages = [];
        for (const segment in entry) {
            const validator = joi.object().keys(entry[segment]);
            const { error } = validator.validate(req[segment], { messages, abortEarly: false });
            if (!error) {
                continue;
            }
            error.details.forEach((validationError) => {
                errorMessages.push(validationError.message);
            });
        }

        if (errorMessages.length !== 0) {
            return res.status(403).json({ status: 'error', messages: errorMessages });
        }
        next();
    };
}

module.exports = { joi, validate };
