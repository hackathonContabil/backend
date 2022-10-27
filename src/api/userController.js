const { Router } = require('express');
const { normalizeEmail } = require('../helper');
const {
    listUsersValidation,
    authenticateUserValidation,
    createClientUserValidation,
    createAccountantUserValidation,
} = require('./userValidation');
const ensureUserIsAdmin = require('./middlewares/ensureUserIsAdmin');
const ensureAuthentication = require('./middlewares/ensureAuthentication');
const ensureUserIsAccountant = require('./middlewares/ensureUserIsAccountant');

module.exports = class UserController {
    constructor(
        activateUserAccountUsecase,
        authenticateUserUsecase,
        createUserUsecase,
        listUsersUsecase
    ) {
        this.activateUserAccountUsecase = activateUserAccountUsecase;
        this.authenticateUserUsecase = authenticateUserUsecase;
        this.createUserUsecase = createUserUsecase;
        this.listUsersUsecase = listUsersUsecase;
    }

    router() {
        const router = Router();
        router.get(
            '/',
            listUsersValidation,
            ensureAuthentication,
            ensureUserIsAccountant,
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

        router.post('/admin', async (_, res) => {
            const user = await this.createUserUsecase.execute({
                name: 'admin',
                email: 'admin@admin.com',
                password: 'admin@admin',
                isAdmin: true,
                isActive: true,
                isAccountant: true,
            });
            delete user.email;
            delete user.password;
            return res.json({ status: 'success', data: { user } });
        });

        router.post(
            '/client',
            ensureAuthentication,
            ensureUserIsAccountant,
            createClientUserValidation,
            async (req, res) => {
                const { name, email, password, document } = req.body;

                const user = await this.createUserUsecase.execute({
                    name,
                    email: normalizeEmail(email),
                    password,
                    document,
                    isAdmin: false,
                    isActive: false,
                    isAccountant: false,
                });
                delete user.email;
                delete user.password;
                delete user.document;
                return res.json({ status: 'success', data: { user } });
            }
        );

        router.post(
            '/accountant',
            ensureAuthentication,
            ensureUserIsAdmin,
            createAccountantUserValidation,
            async (req, res) => {
                const { name, email, password } = req.body;

                const user = await this.createUserUsecase.execute({
                    name,
                    email: normalizeEmail(email),
                    password,
                    isAdmin: false,
                    isActive: false,
                    isAccountant: true,
                });
                delete user.email;
                delete user.password;
                return res.json({ status: 'success', data: { user } });
            }
        );

        router.get('/activate/:token', async (req, res) => {
            const { token: activateAccountToken } = req.params;

            let success = true;
            try {
                await this.activateUserAccountUsecase.execute(activateAccountToken);
            } catch {
                success = false;
            }
            return res.render('activate-account', { success });
        });
        return router;
    }
};
