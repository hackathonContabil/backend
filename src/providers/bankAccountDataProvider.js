const pluggy = require('pluggy-sdk');

const pluggyBankData = {
    SANDBOX: { id: 8, name: 'Pluggy Bank BR Business', color: '#ef294b' },
};

module.exports = class {
    clientId = process.env.PLUGGY_CLIENT_ID;
    clientSecret = process.env.PLUGGY_SECRET;

    constructor() {
        this.client = new pluggy.PluggyClient({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
        });
    }

    getBankData(id) {
        for (const data of pluggyBankData) {
            if (data.id == id) {
                return data;
            }
        }
    }

    getBanks() {
        const banks = Object.values(pluggyBankData);
        return banks;
    }

    async getSandboxConnector() {
        const DEFAULT_USER = 'user-ok';
        const DEFAULT_PASSWORD = 'password-ok';
        const { id: connector } = await this.client.createItem(pluggyBankData.SANDBOX.id, {
            user: DEFAULT_USER,
            password: DEFAULT_PASSWORD,
        });
        return connector;
    }

    async getTransactionsReferenceByConnector(connector) {
        try {
            const {
                results: [account],
            } = await this.client.fetchAccounts(connector);
            return account.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getTransactions(transactionsReference) {
        const transactions = [];
        while (true) {
            const { totalPages, page, results } = await this.client.fetchTransactions(
                transactionsReference
            );
            transactions.push(...results);
            if (page === totalPages) {
                break;
            }
        }
        return transactions;
    }
};
