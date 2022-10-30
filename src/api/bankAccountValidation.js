const { joi, validate } = require('./middlewares/validateEntry');

const listTransactionsValidation = validate({
    query: {
        page: joi.number().required().label('Página').min(0),
        limit: joi.number().required().label('Limite').min(0),
        userId: joi.number().label('Usuário'),
        from: joi.date().label('Data inicial'),
        to: joi.date().label('Data final'),
    },
});

module.exports = { listTransactionsValidation };
