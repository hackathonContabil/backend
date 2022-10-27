const { parse } = require('json2csv');

module.exports = class SpreadsheetProvider {
    getTransactionsDataSpreadsheet(transactions) {
        const options = {
            fields: ['field1', 'field2', 'field3'],
        };
        const csv = parse(transactions, options);
        return csv;
    }
};
