const pluggy = require('pluggy-sdk');

const pluggyBankData = {
    SANDBOX: { id: 8, name: 'Pluggy Bank BR Business', color: '#ef294b' },
};

module.exports = class BankAccountDataProvider {
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

    async createSandboxAccountConnectionId({ user, password }) {
        const { id: connectionId } = await this.client.createItem(pluggyBankData.SANDBOX.id, {
            user: `user-${user}`,
            password: `password-${password}`,
        });
        return connectionId;
    }
};
