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
                email: {
                    type: DataTypes.STRING(192),
                    unique: true,
                    allowNull: false,
                },
                password: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                document: {
                    type: DataTypes.STRING(32),
                    unique: true,
                    allowNull: false,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                isAdmin: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                activatedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            { tableName: 'users', sequelize, timestamps: true }
        );
    }
};
