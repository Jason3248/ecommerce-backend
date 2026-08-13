const { Model, DataTypes } = require("sequelize");

class EmailVerificationToken extends Model
{
    static initModel(sequelize)
    {
        EmailVerificationToken.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
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
            }
        },
            {
                sequelize,
                modelName: 'EmailVerificationToken',
                tableName: 'email_verification_tokens',
                underscored: true,
                createdAt: 'created_at',
                updatedAt: false
            }
        );
        return EmailVerificationToken;
    }

    static associate(models)
    {
        EmailVerificationToken.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}

module.exports = EmailVerificationToken;