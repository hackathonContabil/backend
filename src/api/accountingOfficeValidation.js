const { joi, validate } = require('./middlewares/validateEntry');

const createAccountingOfficeValidation = validate({
    body: {
        name: joi.string().required().label('Nome').min(3).max(60),
        document: joi.string().required().label('CNPJ').length(14),
    },
});

module.exports = { createAccountingOfficeValidation };
