const { Router } = require('express');
const { createAccountingOfficeValidation } = require('./accountingOfficeValidation');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsAdmin = require('./middlewares/ensureUserIsAdmin');

module.exports = class AccountingOfficeController {
    constructor(createAccountingOfficeUsecase) {
        this.createAccountingOfficeUsecase = createAccountingOfficeUsecase;
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
                return res.json({ status: 'success', data: { accountingOffice } });
            }
        );
        return router;
    }
};
