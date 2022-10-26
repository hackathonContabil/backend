const { joi, validate } = require('./middleware/validateEntry');

const elevenOrFourteenCharsValidation = /^(?:[0-9]{11}|[0-9]{14})$/;
const createUserValidation = validate({
    body: {
        name: joi.string().required().label('Nome').max(128),
        email: joi.string().email().required().label('E-mail').max(128),
        password: joi.string().required().label('Senha').max(128),
        document: joi.string().regex(elevenOrFourteenCharsValidation).required().label('Documento'),
    },
});

const authenticateUserValidation = validate({
    body: {
        email: joi.string().email().required().label('E-mail').max(128),
        password: joi.string().required().label('Senha').max(128),
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
