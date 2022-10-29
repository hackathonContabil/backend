const { Model, DataTypes } = require('sequelize');

module.exports = class Transactions extends Model {
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
                transactionCode: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                amount: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                balance: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING(128),
                },
                descriptionRaw: {
                    type: DataTypes.STRING(244),
                },
                transactionDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            { tableName: 'transactions', sequelize, timestamps: true }
        );
    }
};
