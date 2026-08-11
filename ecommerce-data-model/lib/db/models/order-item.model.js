const { DataTypes, Model } = require("sequelize");

class OrderItem extends Model
{
    static initModel(sequelize)
    {
        OrderItem.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                orderId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                productId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                quantity: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1
                    }
                },
                productName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    set(value)
                    {
                        this.setDataValue("productName", value.trim())
                    }
                },
                productSku: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: false,
                    set(value)
                    {
                        this.setDataValue("productSku", value.trim())
                    }
                },
                unitPrice: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                },
                lineTotal: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                }
            },
            {
                sequelize,
                modelName: 'OrderItem',
                tableName: 'order_items',
                timestamps: true,
                underscored: true
            }
        )
        return OrderItem;
    }

    static associate(models)
    {
        OrderItem.belongsTo(models.Order, {
            foreignKey: 'orderId',
            as: 'order'
        });

        OrderItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        })
    }
}

module.exports = OrderItem;