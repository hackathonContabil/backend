const { joi, validate } = require('./middlewares/validateEntry');

const listTransactionsValidation = validate({
    query: {
        page: joi.number().required().label('Página').min(0),
        limit: joi.number().required().label('Limite').min(0),
        userId: joi.number().label('Usuário'),
    },
});

module.exports = { listTransactionsValidation };
