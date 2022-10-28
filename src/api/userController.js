const { Router } = require('express');
const { normalizeEmail } = require('../helper');
const {
    listUsersValidation,
    authenticateUserValidation,
    createClientUserValidation,
    createAccountantUserValidation,
} = require('./userValidation');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsAccountant = require('./middlewares/ensureUserIsAccountant');

module.exports = class {
    constructor(authenticateUserUsecase, confirmEmailUsecase, createUserUsecase, listUsersUsecase) {
        this.authenticateUserUsecase = authenticateUserUsecase;
        this.confirmEmailUsecase = confirmEmailUsecase;
        this.createUserUsecase = createUserUsecase;
        this.listUsersUsecase = listUsersUsecase;
    }

    router() {
        const router = Router();
        router.get(
            '/',
            ensureAuthentication,
            ensureUserIsAccountant,
            listUsersValidation,
            async (req, res) => {
                const { page, limit, filter } = req.query;

                const users = await this.listUsersUsecase.execute({ page, limit, filter }, {});
                return res.json({ status: 'success', data: { users } });
            }
        );

        router.post('/auth', authenticateUserValidation, async (req, res) => {
            const { email, password } = req.body;

            const authenticationData = await this.authenticateUserUsecase.execute({
                email: normalizeEmail(email),
                password,
            });
            return res.json({ status: 'success', data: { ...authenticationData } });
        });

        router.post('/accountant', createAccountantUserValidation, async (req, res) => {
            const { name, email, password, accountantState, accountingOfficeId } = req.body;

            const user = await this.createUserUsecase.execute({
                name,
                email: normalizeEmail(email),
                password,
                accountantState,
                accountingOfficeId,
                isAccountant: true,
            });
            delete user.email;
            delete user.password;
            return res.json({ status: 'success', data: { user } });
        });

        router.post('/client', createClientUserValidation, async (req, res) => {
            const { name, email, phone, password, document, accountingOfficeId } = req.body;

            const user = await this.createUserUsecase.execute({
                name,
                phone,
                email: normalizeEmail(email),
                password,
                document,
                isClient: true,
                accountingOfficeId,
            });
            delete user.email;
            delete user.password;
            delete user.document;
            return res.json({ status: 'success', data: { user } });
        });

        router.get('/confirm-email/:token', async (req, res) => {
            const { token: confirmEmailToken } = req.params;

            let success = true;
            try {
                await this.confirmEmailUsecase.execute(confirmEmailToken);
            } catch {
                success = false;
            }
            return res.render('confirm-email', { success });
        });
        return router;
    }
};
