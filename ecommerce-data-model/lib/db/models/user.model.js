const { DataTypes, Model } = require("sequelize");


class User extends Model
{
    static initModel(sequelize)
    {
        User.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                firstName: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    validate: {
                        len: [2, 50]
                    },
                    set(value)
                    {
                        this.setDataValue("firstName", value.trim());
                    }
                },
                lastName: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    validate: {
                        len: [2, 50]
                    },
                    set(value)
                    {
                        this.setDataValue("lastName", value.trim());
                    }
                },
                email: {
                    type: DataTypes.STRING(255),
                    unique: true,
                    allowNull: false,
                    validate: {
                        isEmail: true
                    },
                    set(value)
                    {
                        this.setDataValue("email", value.trim().toLowerCase());
                    }
                },
                password: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                role: {
                    type: DataTypes.ENUM('CUSTOMER', 'ADMIN'),
                    defaultValue: 'CUSTOMER',
                    allowNull: false,
                    validate: {
                        isIn: [['CUSTOMER', 'ADMIN']]
                    },
                    set(value)
                    {
                        this.setDataValue("role", value.trim().toUpperCase());
                    }
                },
                isEmailVerified: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                },
                isBlocked: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                },
            },
            {
                sequelize,
                modelName: 'User',
                tableName: 'users',
                timestamps: true,
                underscored: true,
                paranoid: true
            }
        )
        return User;
    }

    static associate(models)
    {
        User.hasOne(models.Cart, {
            foreignKey: 'userId',
            as: 'cart'
        });

        User.hasMany(models.Order, {
            foreignKey: 'userId',
            as: 'orders'
        });

        User.hasMany(models.Payment, {
            foreignKey: 'userId',
            as: 'payments'
        });

        User.hasMany(models.PasswordResetToken, {
            foreignKey: 'userId',
            as: 'passwordResetTokens'
        });

        User.hasMany(models.EmailVerificationToken, {
            foreignKey: 'userId',
            as: 'emailVerificationTokens'
        });

        User.hasMany(models.EmailUpdationToken, {
            foreignKey: 'userId',
            as: 'emailUpdationTokens'
        });
    }
}

module.exports = User;