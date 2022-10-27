module.exports = {
    // Internal msgs
    internal: {
        status: 500,
        message: 'Error interno no servidor, espere um tempinho e tente novamente',
    },
    // User msgs
    'invalid-token': {
        status: 400,
        message: 'Token inválido, corrija os valores e tente novamente',
    },
    'invalid-credentials': {
        status: 400,
        message: 'Credenciais inválidas, corrija os valores e tente novamente',
    },
    'is-not-sharing-bank-account-data': {
        status: 400,
        message:
            'Operação inválida, para acessar esta funcionalidade, libere o acesso aos seus dados bancários',
    },
};
