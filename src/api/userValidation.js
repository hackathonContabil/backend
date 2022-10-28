const { joi, validate } = require('./middlewares/validateEntry');

const listUsersValidation = validate({
    query: {
        page: joi.number().required().label('Página').min(0),
        limit: joi.number().required().label('Limite').min(0),
        filter: joi.string().label('Filtro').max(128),
    },
});

const authenticateUserValidation = validate({
    body: {
        email: joi.string().email().required().label('E-mail').max(128),
        password: joi.string().required().label('Senha').min(8).max(128),
    },
});

const createClientUserValidation = validate({
    body: {
        name: joi.string().required().label('Nome').min(8).max(128),
        phone: joi.string().required().label('Telefone').min(8).max(14),
        email: joi.string().email().label('E-mail').max(128),
        password: joi.string().required().label('Senha').min(8).max(128),
        document: joi.string().required().label('CNPJ').length(14),
        accountingOfficeId: joi.number().required().label('Escritório').min(1),
    },
});

const createAccountantUserValidation = validate({
    body: {
        name: joi.string().required().label('Nome').min(8).max(128),
        email: joi.string().email().label('E-mail').max(128),
        password: joi.string().required().label('Senha').min(8).max(128),
        accountantState: joi.string().required().label('CRC').length(2),
        accountingOfficeId: joi.number().required().label('Escritório').min(1),
    },
});

module.exports = {
    listUsersValidation,
    authenticateUserValidation,
    createClientUserValidation,
    createAccountantUserValidation,
};
