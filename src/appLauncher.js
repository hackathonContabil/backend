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
const BankAccountRepository = require('./repositories/bankAccountRepository');
const UserRepository = require('./repositories/userRepository');
const ConnectBankAccountUsecase = require('./usecases/bankAccount/connectBankAccountUsecase');
const CreateAccountingOfficeUsecase = require('./usecases/accountingOffice/createAccountingOfficeUsecase');
const DeleteAccountingOfficeUsecase = require('./usecases/accountingOffice/deleteAccountingOfficeUsecase');
const ListAccountingOfficesUsecase = require('./usecases/accountingOffice/listAccountingOfficesUsecase');
const FillAccountsTransactionsReferencesUsecase = require('./usecases/bankAccount/fillAccountsTransactionsReferencesUsecase');
const ExportTransactionsDataSpreadsheetUsecase = require('./usecases/bankAccount/exportTransactionsDataSpreadsheetUsecase');
const BankAccountController = require('./api/bankAccountController');
const ConfirmEmailUsecase = require('./usecases/user/confirmEmailUsecase');
const AccountingOfficeController = require('./api/accountingOfficeController');
const ActivateUserUsecase = require('./usecases/user/activateUserUsecase');
const AuthenticateUserUsecase = require('./usecases/user/authenticateUserUsecase');
const CreateUserUsecase = require('./usecases/user/createUserUsecase');
const DeleteExpiredUsersWithNonConfirmedEmailUsecase = require('./usecases/user/deleteExpiredUsersWithNonConfirmedEmailUsecase');
const ListUsersUsecase = require('./usecases/user/listUsersUsecase');
const AllowToShareBankAccountDataUsecase = require('./usecases/user/allowToShareBankAccountDataUsecase');
const UserScheduler = require('./scheduler/userScheduler');
const BankAccountScheduler = require('./scheduler/bankAccountScheduler');
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
            AccountingOffice.hasMany(User, {
                onDelete: 'CASCADE',
                foreignKey: 'accountingOfficeId',
            });

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
        const bankAccountRepository = new BankAccountRepository();
        const userRepository = new UserRepository();

        // Accounting Office modules
        const createAccountingOfficeUsecase = new CreateAccountingOfficeUsecase(
            accountingOfficeRepository,
            cryptoProvider
        );
        const deleteAccountingOfficeUsecase = new DeleteAccountingOfficeUsecase(
            accountingOfficeRepository
        );
        const listAccountingOfficesUsecase = new ListAccountingOfficesUsecase(
            accountingOfficeRepository
        );
        const accountingOfficeController = new AccountingOfficeController(
            createAccountingOfficeUsecase,
            deleteAccountingOfficeUsecase,
            listAccountingOfficesUsecase
        );
        this.expressServer.use('/api/v1/accounting-office', accountingOfficeController.router());

        // User modules
        const activateUserUsecase = new ActivateUserUsecase(userRepository);
        const authenticateUserUsecase = new AuthenticateUserUsecase(
            userRepository,
            cryptoProvider,
            tokenProvider
        );
        const confirmEmailUsecase = new ConfirmEmailUsecase(
            userRepository,
            cryptoProvider,
            tokenProvider
        );
        const createUserUsecase = new CreateUserUsecase(
            accountingOfficeRepository,
            userRepository,
            cryptoProvider,
            tokenProvider,
            mailProvider
        );
        const listUsersUsecase = new ListUsersUsecase(userRepository, cryptoProvider);
        const allowToShareBankAccountDataUsecase = new AllowToShareBankAccountDataUsecase(
            userRepository
        );
        const userController = new UserController(
            activateUserUsecase,
            authenticateUserUsecase,
            confirmEmailUsecase,
            createUserUsecase,
            listUsersUsecase,
            allowToShareBankAccountDataUsecase
        );
        this.expressServer.use('/api/v1/user', userController.router());

        const deleteExpiredUsersWithNonConfirmedEmailUsecase =
            new DeleteExpiredUsersWithNonConfirmedEmailUsecase(userRepository);
        const userScheduler = new UserScheduler(deleteExpiredUsersWithNonConfirmedEmailUsecase);
        userScheduler.init();

        //  Bank account modules
        const connectBankAccountUsecase = new ConnectBankAccountUsecase(
            bankAccountRepository,
            userRepository,
            cryptoProvider,
            bankAccountDataProvider
        );
        const bankAccountController = new BankAccountController(connectBankAccountUsecase);
        this.expressServer.use('/api/v1/bank-account', bankAccountController.router());

        // File modules
        const exportTransactionsDataSpreadsheetUsecase =
            new ExportTransactionsDataSpreadsheetUsecase(tokenProvider, spreadsheetProvider);
        const fileController = new FileController(exportTransactionsDataSpreadsheetUsecase);
        this.expressServer.use('/api/v1/file', fileController.router());

        const fillAccountsTransactionsReferencesUsecase =
            new FillAccountsTransactionsReferencesUsecase(
                bankAccountRepository,
                cryptoProvider,
                bankAccountDataProvider
            );
        const bankAccountScheduler = new BankAccountScheduler(
            fillAccountsTransactionsReferencesUsecase
        );
        bankAccountScheduler.init();
    }
};
