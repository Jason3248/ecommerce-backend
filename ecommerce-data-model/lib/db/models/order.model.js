const {DataTypes, Model} = require("sequelize");

class Order extends Model{
    static initModel(sequelize){
        Order.init(
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
                status: {
                    type: DataTypes.ENUM('PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED','PAYMENT_FAILED'),
                    defaultValue: 'PAYMENT_PENDING',
                    allowNull: false,
                    validate: {
                        isIn: [['PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED','PAYMENT_FAILED']]
                    },
                    set(value){
                        this.setDataValue("status", value.trim().toUpperCase());
                    }
                },
                subtotalAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                },
                taxAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    defaultValue: 0,
                    allowNull: true
                },
                shippingAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    defaultValue: 0,
                    allowNull: false,
                },
                totalAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                }
            },
            {
                sequelize,
                modelName: 'Order',
                tableName: 'orders',
                timestamps: true,
                underscored: true
            }
        )
        return Order;
    }

    static associate(models){
        Order.hasMany(models.OrderItem, {
            foreignKey: 'orderId',
            as: 'items'
        });

        Order.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        Order.hasMany(models.Payment, {
            foreignKey: 'orderId',
            as: 'payments'
        });
    }
}

module.exports = Order;