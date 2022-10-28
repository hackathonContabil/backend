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
const ensureUserIsAdmin = require('./middlewares/ensureUserIsAdmin');
const ensureUserIsClient = require('./middlewares/ensureUserIsClient');

module.exports = class {
    constructor(
        activateUserUsecase,
        authenticateUserUsecase,
        confirmEmailUsecase,
        createUserUsecase,
        listUsersUsecase,
        shareBankAccountDataUsecase
    ) {
        this.activateUserUsecase = activateUserUsecase;
        this.authenticateUserUsecase = authenticateUserUsecase;
        this.confirmEmailUsecase = confirmEmailUsecase;
        this.createUserUsecase = createUserUsecase;
        this.listUsersUsecase = listUsersUsecase;
        this.shareBankAccountDataUsecase = shareBankAccountDataUsecase;
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
            delete user.phone;
            delete user.email;
            delete user.password;
            delete user.document;
            delete user.isSharingBankAccountData;
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
            delete user.phone;
            delete user.email;
            delete user.password;
            delete user.document;
            delete user.accountantState;
            return res.json({ status: 'success', data: { user } });
        });

        router.post(
            '/client/share-bank-account-data',
            ensureAuthentication,
            ensureUserIsClient,
            async (req, res) => {
                await this.shareBankAccountDataUsecase.execute(req.user.id);
                return res.json({ status: 'success' });
            }
        );

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

        router.post('/activate/:id', ensureAuthentication, ensureUserIsAdmin, async (req, res) => {
            const { id } = req.params;

            await this.activateUserUsecase.execute(id);
            return res.json({ status: 'success' });
        });
        return router;
    }
};
