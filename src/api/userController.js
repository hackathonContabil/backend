const { Router } = require('express');
const { normalizeName, normalizeEmail } = require('../helper');
const {
    listUsersValidation,
    authenticateUserValidation,
    createClientUserValidation,
    createAccountantUserValidation,
} = require('./userValidation');
const ensureUserIsAdminOrAccountant = require('./middlewares/ensureUserIsAdminOrAccountant');
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
        allowToShareBankAccountDataUsecase
    ) {
        this.activateUserUsecase = activateUserUsecase;
        this.authenticateUserUsecase = authenticateUserUsecase;
        this.confirmEmailUsecase = confirmEmailUsecase;
        this.createUserUsecase = createUserUsecase;
        this.listUsersUsecase = listUsersUsecase;
        this.allowToShareBankAccountDataUsecase = allowToShareBankAccountDataUsecase;
    }

    router() {
        const router = Router();
        router.get(
            '/',
            ensureAuthentication,
            ensureUserIsAdminOrAccountant,
            listUsersValidation,
            async (req, res) => {
                const { page, limit, filter } = req.query;
                const { isAccountant, accountingOfficeId } = req.user;

                const users = await this.listUsersUsecase.execute({
                    page,
                    limit,
                    filter,
                    isAccountant,
                    accountingOfficeId,
                });
                return res.json({ status: 'success', data: { users } });
            }
        );

        router.post('/auth', authenticateUserValidation, async (req, res) => {
            const { email, password } = req.body;

            const authenticationData = await this.authenticateUserUsecase.execute({
                email: normalizeEmail(email),
                password,
            });
            return res.json({ status: 'success', data: authenticationData });
        });

        router.get('/auth/validate', ensureAuthentication, async (req, res) => {
            const { isAdmin, isClient, isAccountant, isSharingBankAccountData } = req.user;
            return res.json({
                status: 'success',
                data: { isAdmin, isClient, isAccountant, isSharingBankAccountData },
            });
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

        router.post('/accountant', createAccountantUserValidation, async (req, res) => {
            const { name, email, password, accountantLicense, accountingOfficeId } = req.body;

            const user = await this.createUserUsecase.execute({
                name,
                email: normalizeEmail(email),
                password,
                accountantLicense,
                accountingOfficeId,
                isAccountant: true,
            });
            delete user.phone;
            delete user.email;
            delete user.password;
            delete user.document;
            delete user.accountantLicense;
            delete user.isSharingBankAccountData;
            return res.status(201).json({ status: 'success', data: { user } });
        });

        router.post(
            '/accountant/activate/:id',
            ensureAuthentication,
            ensureUserIsAdmin,
            async (req, res) => {
                const { id } = req.params;

                await this.activateUserUsecase.execute({ id, isAccountant: true });
                return res.status(204).send();
            }
        );

        router.post('/client', createClientUserValidation, async (req, res) => {
            const { name, email, phone, password, document, accountingOfficeId } = req.body;

            const user = await this.createUserUsecase.execute({
                name: normalizeName(name),
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
            delete user.accountantLicense;
            return res.status(201).json({ status: 'success', data: { user } });
        });

        router.post(
            '/client/activate/:id',
            ensureAuthentication,
            ensureUserIsAccountant,
            async (req, res) => {
                const { id } = req.params;
                const { accountingOfficeId } = req.user;

                await this.activateUserUsecase.execute({ id, isClient: true, accountingOfficeId });
                return res.status(204).send();
            }
        );

        router.post(
            '/client/share-bank-account-data',
            ensureAuthentication,
            ensureUserIsClient,
            async (req, res) => {
                await this.allowToShareBankAccountDataUsecase.execute(req.user.id);
                return res.status(204).send();
            }
        );
        return router;
    }
};
