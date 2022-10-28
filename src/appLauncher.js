const { join } = require('path');
const cors = require('cors');
const express = require('express');
const compression = require('compression');
const { engine } = require('express-handlebars');
const { Sequelize } = require('sequelize');
const errorHandler = require('./api/middlewares/errorHandler');

const AccountingOffice = require('./models/accountingOffice');
const BankAccountConnector = require('./models/bankAccountConnector');
const User = require('./models/user');

const BankAccountDataProvider = require('./providers/bankAccountDataProvider');
const CryptoProvider = require('./providers/cryptoProvider');
const MailProvider = require('./providers/mailProvider');
const SpreadsheetProvider = require('./providers/spreadsheetProvider');
const TokenProvider = require('./providers/tokenProvider');

const AccountingOfficeRepository = require('./repositories/accountingOfficeRepository');
const BankAccountConnectorRepository = require('./repositories/bankAccountConnectorRepository');
const UserRepository = require('./repositories/userRepository');

const CreateAccountingOfficeUsecase = require('./usecases/accountOffice/createAccountingOfficeUsecase');
const ConnectBankAccountUsecase = require('./usecases/bankAccount/connectBankAccountUsecase');
const ExportTransactionsDataSpreadsheet = require('./usecases/bankAccount/exportTransactionsDataSpreadsheet');
const BankAccountController = require('./api/bankAccountController');
const ActivateUserAccountUsecase = require('./usecases/user/activateUserAccountUsecase');
const AccountingOfficeController = require('./api/accountingOfficeController');
const AuthenticateUserUsecase = require('./usecases/user/authenticateUserUsecase');
const CreateUserUsecase = require('./usecases/user/createUserUsecase');
const DeleteExpiredNonActiveUsers = require('./usecases/user/deleteExpiredNonActiveUsers');
const ListUsersUsecase = require('./usecases/user/listUsersUsecase');

const UserScheduler = require('./scheduler/userScheduler');
const FileController = require('./api/fileController');
const UserController = require('./api/userController');

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
        await this.initModulesRoutesAndSchedules();

        this.expressServer.use(errorHandler);

        this.expressServer.listen(this.httpServerPort, () => {
            console.info(`server started at ${this.httpServerPort}`);
        });
    }

    async initSequelizeMainDatabaseConnection() {
        try {
            const sequelize = new Sequelize(this.mainDatabaseUrl, { logging: false });
            await sequelize.authenticate();

            AccountingOffice.init(sequelize);
            BankAccountConnector.init(sequelize);
            User.init(sequelize);
            User.hasMany(BankAccountConnector, { foreignKey: 'userId' });
            AccountingOffice.hasMany(User, { foreignKey: 'accountingOfficeId' });

            await sequelize.sync();
        } catch (error) {
            console.error('Unable to connect to the main database.', error);
            process.exit(1);
        }
    }

    async initModulesRoutesAndSchedules() {
        // Dependencies
        const bankAccountDataProvider = new BankAccountDataProvider();
        const cryptoProvider = new CryptoProvider();
        const mailProvider = new MailProvider();
        const spreadsheetProvider = new SpreadsheetProvider();
        const tokenProvider = new TokenProvider();

        const accountingOfficeRepository = new AccountingOfficeRepository();
        const bankAccountConnectorRepository = new BankAccountConnectorRepository();
        const userRepository = new UserRepository();

        // Accounting Office modules
        const createAccountingOfficeUsecase = new CreateAccountingOfficeUsecase(
            accountingOfficeRepository
        );
        const accountingOfficeController = new AccountingOfficeController(
            createAccountingOfficeUsecase
        );
        this.expressServer.use('/api/v1/accounting-office', accountingOfficeController.router());

        AccountingOfficeController;
        // User modules
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

        //  Bank account modules
        const connectBankAccountUsecase = new ConnectBankAccountUsecase(
            bankAccountConnectorRepository,
            cryptoProvider,
            bankAccountDataProvider
        );
        const bankAccountController = new BankAccountController(connectBankAccountUsecase);
        this.expressServer.use('/api/v1/bank-account', bankAccountController.router());

        // File modules
        const exportTransactionsDataSpreadsheet = new ExportTransactionsDataSpreadsheet(
            tokenProvider,
            spreadsheetProvider
        );
        const fileController = new FileController(exportTransactionsDataSpreadsheet);
        this.expressServer.use('/api/v1/file', fileController.router());
    }
};
