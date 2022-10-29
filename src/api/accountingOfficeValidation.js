const { joi, validate } = require('./middlewares/validateEntry');

const createAccountingOfficeValidation = validate({
    body: {
        name: joi.string().required().label('Nome').min(3).max(60),
        document: joi.string().required().label('CNPJ').length(14),
    },
});

const listUsersValidation = validate({
    query: {
        page: joi.number().required().label('Página').min(0),
        limit: joi.number().required().label('Limite').min(0),
        filter: joi.string().label('Filtro').max(128),
    },
});

module.exports = { createAccountingOfficeValidation, listUsersValidation };
