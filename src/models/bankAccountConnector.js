const { Model, DataTypes } = require('sequelize');

module.exports = class BankAccountConnector extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    required: true,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: DataTypes.INTEGER,
                    references: {
                        key: 'id',
                        model: 'users',
                    },
                },
                connector: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                transactionsReference: {
                    type: DataTypes.STRING(64),
                },
            },
            { tableName: 'bankAccountConnectors', sequelize, timestamps: true }
        );
    }
};
