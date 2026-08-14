const { Model, DataTypes } = require("sequelize");

class EmailUpdationToken extends Model
{
    static initModel(sequelize)
    {
        EmailUpdationToken.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                newEmail: {
                    type: DataTypes.STRING(255),
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
                modelName: 'EmailUpdationToken',
                tableName: 'email_updation_tokens',
                underscored: true,
                createdAt: 'created_at',
                updatedAt: false
            }
        );
        return EmailUpdationToken;
    }


    static associate(models)
    {
        EmailUpdationToken.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}


module.exports = EmailUpdationToken;