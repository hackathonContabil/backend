const { Model, DataTypes } = require('sequelize');

module.exports = class User extends Model {
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
                    type: DataTypes.STRING(128),
                    allowNull: false,
                },
                phone: {
                    type: DataTypes.STRING(32),
                    unique: true,
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING(192),
                    unique: true,
                    allowNull: false,
                },
                isEmailConfirmed: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                emailConfirmedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                password: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                document: {
                    type: DataTypes.STRING(32),
                    unique: true,
                    allowNull: true,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                activatedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                isAdmin: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                isClient: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                isAccountant: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                accountantLicense: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                accountingOfficeId: {
                    type: DataTypes.INTEGER,
                    references: {
                        key: 'id',
                        model: 'accountingOffices',
                    },
                },
                isSharingBankAccountData: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                acceptedShareBankAccountDataAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            { tableName: 'users', sequelize, timestamps: true }
        );
    }
};
