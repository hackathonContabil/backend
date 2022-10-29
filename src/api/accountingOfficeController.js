const { Router } = require('express');
const { normalizeName } = require('../helper');
const {
    createAccountingOfficeValidation,
    listUsersValidation,
} = require('./accountingOfficeValidation');
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
                    name: normalizeName(name),
                    document,
                });
                delete accountingOffice.document;
                return res.status(201).json({ status: 'success', data: { accountingOffice } });
            }
        );

        router.delete('/:id', ensureAuthentication, ensureUserIsAdmin, async (req, res) => {
            const { id } = req.params;

            await this.deleteAccountingOfficeUsecase.execute(id);
            return res.status(204).send();
        });

        router.get(
            '/',
            ensureAuthentication,
            ensureUserIsAdmin,
            listUsersValidation,
            async (req, res) => {
                const { page, limit, filter } = req.query;

                const { offices, count } = await this.listAccountingOfficesUsecase.execute({
                    page,
                    limit,
                    filter,
                });
                return res.json({ status: 'success', data: { count, offices } });
            }
        );

        router.get('/public', async (_, res) => {
            const { offices } = await this.listAccountingOfficesUsecase.execute({});
            const officesToReturn = offices.map(({ id, name }) => {
                return { id, name };
            });
            return res.json({ status: 'success', data: officesToReturn });
        });
        return router;
    }
};
