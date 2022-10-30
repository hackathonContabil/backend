const { Router } = require('express');
const { listTransactionsValidation } = require('./bankAccountValidation');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsClient = require('./middlewares/ensureUserIsClient');
const ensureUserIsClientOrAccountant = require('./middlewares/ensureUserIsClientOrAccountant');
const ensureUserIsAccountant = require('./middlewares/ensureUserIsAccountant');

module.exports = class {
    constructor(
        exportTransactionsDataSpreadsheetUsecase,
        connectBankAccountUsecase,
        listTransactionsUsecase,
        bankAccountDataProvider
    ) {
        this.exportTransactionsDataSpreadsheetUsecase = exportTransactionsDataSpreadsheetUsecase;
        this.connectBankAccountUsecase = connectBankAccountUsecase;
        this.listTransactionsUsecase = listTransactionsUsecase;
        this.bankAccountDataProvider = bankAccountDataProvider;
    }

    router() {
        const router = Router();

        router.get('/', ensureAuthentication, ensureUserIsClient, async (_, res) => {
            const banks = this.bankAccountDataProvider.getBanks();
            return res.json({ status: 'success', data: banks });
        });

        router.get(
            '/export/banking-reconciliation/:id',
            ensureAuthentication,
            ensureUserIsAccountant,
            async (req, res) => {
                const { from, to } = req.query;
                const { id: userId } = req.params;

                const spreadsheet = await this.exportTransactionsDataSpreadsheetUsecase.execute({
                    from,
                    to,
                    userId,
                    accountingOfficeId: req.user.accountingOfficeId,
                    type: 'banking-reconciliation',
                });
                const fileName = `dados-${Date.now()}.csv`;
                return res.attachment(fileName).send(spreadsheet);
            }
        );

        router.get(
            '/export/cash-flow/:id',
            ensureAuthentication,
            ensureUserIsAccountant,
            async (req, res) => {
                const { from, to } = req.query;
                const { id: userId } = req.params;

                const spreadsheet = await this.exportTransactionsDataSpreadsheetUsecase.execute({
                    from,
                    to,
                    userId,
                    accountingOfficeId: req.user.accountingOfficeId,
                    type: 'cash-flow',
                });
                const fileName = `dados-${Date.now()}.csv`;
                return res.attachment(fileName).send(spreadsheet);
            }
        );

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
