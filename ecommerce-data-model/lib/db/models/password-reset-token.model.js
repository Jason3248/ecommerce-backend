const { DataTypes, Model, UUIDV4 } = require("sequelize");

class PasswordResetToken extends Model
{
    static initModel(sequelize)
    {
        PasswordResetToken.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: UUIDV4,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                token: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                usedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: 'PasswordResetToken',
                tableName: 'password_reset_tokens',
                underscored: true,
                updatedAt: false
            }
        );
        return PasswordResetToken;
    }

    static associate(models)
    {
        PasswordResetToken.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        })
    }
}

module.exports = PasswordResetToken;