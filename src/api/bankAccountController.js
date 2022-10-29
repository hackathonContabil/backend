const { Router } = require('express');
const { listTransactionsValidation } = require('./bankAccountValidation');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsClient = require('./middlewares/ensureUserIsClient');
const ensureUserIsClientOrAccountant = require('./middlewares/ensureUserIsClientOrAccountant');

module.exports = class {
    constructor(connectBankAccountUsecase, listTransactionsUsecase) {
        this.connectBankAccountUsecase = connectBankAccountUsecase;
        this.listTransactionsUsecase = listTransactionsUsecase;
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

        router.get(
            '/transactions',
            ensureAuthentication,
            ensureUserIsClientOrAccountant,
            listTransactionsValidation,
            async (req, res) => {
                const { isAccountant, accountingOfficeId } = req.user;
                const { page, limit, from, to, userId } = req.query;

                const transactions = await this.listTransactionsUsecase.execute({
                    page,
                    limit,
                    filter: {
                        from,
                        to,
                        userId: isAccountant ? userId : req.user.id,
                        isAccountant,
                        accountingOfficeId,
                    },
                });
                return res.json({ status: 'success', data: { transactions } });
            }
        );
        return router;
    }
};
