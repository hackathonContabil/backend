const { joi, validate } = require('./middlewares/validateEntry');

const createUserValidation = validate({
    body: {
        name: joi.string().required().label('Nome').min(8).max(128),
        email: joi.string().email().required().label('E-mail').max(128),
        password: joi.string().required().label('Senha').min(8).max(128),
        document: joi.string().label('Documento').length(14),
    },
});

const authenticateUserValidation = validate({
    body: {
        email: joi.string().email().required().label('E-mail').max(128),
        password: joi.string().required().label('Senha').min(8).max(128),
    },
});

const listUsersValidation = validate({
    query: {
        page: joi.number().required().label('Página').min(0),
        limit: joi.number().required().label('Limite').min(0),
        filter: joi.string().label('Filtro').max(128),
    },
});

module.exports = {
    authenticateUserValidation,
    createUserValidation,
    listUsersValidation,
};
