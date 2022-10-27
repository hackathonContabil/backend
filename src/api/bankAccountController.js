const { Router } = require('express');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsAccountant = require('./middlewares/ensureUserIsAccountant');

module.exports = class BankAccountController {
    constructor(connectBankAccountUsecase) {
        this.connectBankAccountUsecase = connectBankAccountUsecase;
    }

    router() {
        const router = Router();

        router.post('/', ensureAuthentication, ensureUserIsAccountant, async (req, res) => {
            const { userId, bank, credentials } = req.body;

            const bankAccount = await this.connectBankAccountUsecase.execute({
                userId,
                bank,
                credentials,
            });
            delete bankAccount.connector;
            return res.json({ status: 'success', data: { bankAccount } });
        });
        return router;
    }
};
