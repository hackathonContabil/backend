const { Model, DataTypes } = require('sequelize');

module.exports = class AccountingOffice extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    required: true,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                document: {
                    type: DataTypes.STRING(32),
                    unique: true,
                },
            },
            { tableName: 'accountingOffices', sequelize, timestamps: true }
        );
    }
};
