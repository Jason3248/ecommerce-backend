const {DataTypes, Model} = require("sequelize");

class Payment extends Model{
    static initModel(sequelize){
        Payment.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: UUIDV4,
                    primaryKey: true
                },
                orderId: {
                    type: DataTypes.UUIDV4,
                    allowNull: false
                },
                userId: {
                    type: DataTypes.UUIDV4,
                    allowNull: false
                },
                gatewayReference: {
                    type: DataTypes.STRING(500),
                    allowNull: true
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                },
                status: {
                    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                    validate: {
                        isIn: [['PENDING', 'SUCCESS', 'FAILED']]
                    },
                    set(value){
                        this.setDataValue("status", value.trim().toUpperCase());
                    }
                },
                method: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    set(value){
                        this.setDataValue("method", value.trim());
                    }
                },
                completedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: 'Payment',
                tableName: 'payments',
                underscored: true,
                timestamps: true,
                updatedAt: false
            }
        )
        return Payment;
    }

    static associate(models){
        Payment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        Payment.belongsTo(models.Order, {
            foreignKey: 'orderId',
            as: 'order'
        });
    }
}

module.exports = Payment;