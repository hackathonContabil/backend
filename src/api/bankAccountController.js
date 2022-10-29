const { Router } = require('express');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsClient = require('./middlewares/ensureUserIsClient');

module.exports = class {
    constructor(connectBankAccountUsecase) {
        this.connectBankAccountUsecase = connectBankAccountUsecase;
    }

    router() {
        const router = Router();

        router.post('/', ensureAuthentication, ensureUserIsClient, async (req, res) => {
            const { bank, credentials } = req.body;

            const bankAccount = await this.connectBankAccountUsecase.execute({
                userId: req.user.id,
                bank,
                credentials,
            });
            delete bankAccount.connector;
            return res.json({ status: 'success', data: { bankAccount } });
        });
        return router;
    }
};
