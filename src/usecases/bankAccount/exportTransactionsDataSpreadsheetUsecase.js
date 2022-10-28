const BadRequestError = require('../../errors/badRequestError');

module.exports = class {
    constructor(tokenProvider, spreadsheetProvider) {
        this.tokenProvider = tokenProvider;
        this.spreadsheetProvider = spreadsheetProvider;
    }

    execute(transactionsOptionsToken) {
        const transactionsOptions = this.tokenProvider.getDataIfIsValid(transactionsOptionsToken);
        if (!transactionsOptions) {
            throw new BadRequestError('invalid-token');
        }
        const data = [
            { field1: 10, field2: 2022, field3: 100 },
            { field1: -10, field2: 2022, field3: 90 },
            { field1: 30, field2: 2022, field3: 120 },
            { field1: 10, field2: 2022, field3: 130 },
        ];
        const spreadsheet = this.spreadsheetProvider.getTransactionsDataSpreadsheet(data);
        return spreadsheet;
    }
};
