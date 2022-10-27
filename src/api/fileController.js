const { Router } = require('express');

module.exports = class FileController {
    constructor(exportTransactionsUsecase) {
        this.exportTransactionsUsecase = exportTransactionsUsecase;
    }
    router() {
        const router = Router();

        router.get('/:token', async (req, res) => {
            const { token: transactionsOptionsToken } = req.params;
            const spreadsheet = this.exportTransactionsUsecase.execute(transactionsOptionsToken);

            const fileName = `dados-${Date.now()}.csv`;
            return res.attachment(fileName).send(spreadsheet);
        });
        return router;
    }
};
