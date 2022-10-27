const { join } = require('path');
const cors = require('cors');
const express = require('express');
const compression = require('compression');
const { engine } = require('express-handlebars');
const { Sequelize } = require('sequelize');
const errorHandler = require('./api/middlewares/errorHandler');
const CryptoProvider = require('./providers/cryptoProvider');
const TokenProvider = require('./providers/tokenProvider');
const MailProvider = require('./providers/mailProvider');
const User = require('./models/user');
const ActivateUserAccountUsecase = require('./usecases/user/activateUserAccountUsecase');
const AuthenticateUserUsecase = require('./usecases/user/authenticateUserUsecase');
const CreateUserUsecase = require('./usecases/user/createUserUsecase');
const DeleteExpiredNonActiveUsers = require('./usecases/user/deleteExpiredNonActiveUsers');
const ListUsersUsecase = require('./usecases/user/listUsersUsecase');
const UserController = require('./api/userController');
const UserScheduler = require('./scheduler/userScheduler');
const UserRepository = require('./repositories/userRepository');

module.exports = class AppLauncher {
    httpServerPort = process.env.HTTP_SERVER_PORT;
    mainDatabaseUrl = process.env.MAIN_DATABASE_CONNECTION_URL;

    constructor() {
        this.expressServer = express();
    }

    async bootstrap() {
        this.expressServer.use(cors());
        this.expressServer.use(compression());
        this.expressServer.use(express.json());

        this.expressServer.engine('handlebars', engine());
        this.expressServer.set('view engine', 'handlebars');
        this.expressServer.set('views', join(__dirname, 'views', 'pages'));

        await this.initSequelizeMainDatabaseConnection();
        await this.initModulesSchedulesAndExpressRoutes();

        this.expressServer.use(errorHandler);

        this.expressServer.listen(this.httpServerPort, () => {
            console.info(`server started at ${this.httpServerPort}`);
        });
    }

    async initSequelizeMainDatabaseConnection() {
        try {
            const sequelize = new Sequelize(this.mainDatabaseUrl, { logging: false });
            await sequelize.authenticate();

            User.init(sequelize);

            await sequelize.sync();
        } catch (error) {
            console.error('Unable to connect to the main database.', error);
            process.exit(1);
        }
    }

    async initModulesSchedulesAndExpressRoutes() {
        const userRepository = new UserRepository();
        const cryptoProvider = new CryptoProvider();
        const tokenProvider = new TokenProvider();
        const mailProvider = new MailProvider();

        const activateUserAccountUsecase = new ActivateUserAccountUsecase(
            userRepository,
            cryptoProvider,
            tokenProvider
        );
        const authenticateUserUsecase = new AuthenticateUserUsecase(
            userRepository,
            cryptoProvider,
            tokenProvider
        );
        const createUserUsecase = new CreateUserUsecase(
            userRepository,
            cryptoProvider,
            tokenProvider,
            mailProvider
        );
        const deleteExpiredNonActiveUsers = new DeleteExpiredNonActiveUsers(userRepository);
        const listUsersUsecase = new ListUsersUsecase(userRepository, cryptoProvider);

        const userScheduler = new UserScheduler(deleteExpiredNonActiveUsers);
        userScheduler.init();

        const userController = new UserController(
            activateUserAccountUsecase,
            authenticateUserUsecase,
            createUserUsecase,
            listUsersUsecase
        );
        this.expressServer.use('/api/v1/user', userController.router());
    }
};
