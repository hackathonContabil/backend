const { Router } = require('express');
const { createAccountingOfficeValidation } = require('./accountingOfficeValidation');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsAdmin = require('./middlewares/ensureUserIsAdmin');

module.exports = class {
    constructor(
        createAccountingOfficeUsecase,
        deleteAccountingOfficeUsecase,
        listAccountingOfficesUsecase
    ) {
        this.createAccountingOfficeUsecase = createAccountingOfficeUsecase;
        this.deleteAccountingOfficeUsecase = deleteAccountingOfficeUsecase;
        this.listAccountingOfficesUsecase = listAccountingOfficesUsecase;
    }

    router() {
        const router = Router();

        router.post(
            '/',
            ensureAuthentication,
            ensureUserIsAdmin,
            createAccountingOfficeValidation,
            async (req, res) => {
                const { name, document } = req.body;

                const accountingOffice = await this.createAccountingOfficeUsecase.execute({
                    name,
                    document,
                });
                return res.status(201).json({ status: 'success', data: { accountingOffice } });
            }
        );

        router.delete('/:id', ensureAuthentication, ensureUserIsAdmin, async (req, res) => {
            const { id } = req.params;

            await this.deleteAccountingOfficeUsecase.execute(id);
            return res.status(204).send();
        });

        router.get('/public', async (_, res) => {
            const offices = await this.listAccountingOfficesUsecase.execute();
            const officesToReturn = offices.map(({ id, name }) => {
                return { id, name };
            });
            return res.json({ status: 'success', data: officesToReturn });
        });
        return router;
    }
};
