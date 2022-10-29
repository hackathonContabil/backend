const { parse } = require('json2csv');

module.exports = class {
    bankingReconciliationSpreadsheet(transactions) {
        const options = {
            fields: [
                'Data',
                'Tipo de Operação',
                'Entrada ou Saida',
                'CPF ou CNPJ',
                'Categoria do Pagto ou Recebimento',
                'Descrição do realizador',
                'Documento',
                'Valor da Operação',
                'Saldo',
            ],
        };
        const spreadsheet = parse(transactions, options);
        return spreadsheet;
    }
};
