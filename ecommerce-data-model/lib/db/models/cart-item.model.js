const {DataTypes, Model} = require("sequelize");

class CartItem extends Model{
    static initModel(sequelize){
        CartItem.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                cartId: {
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
                }
            },
            {
                sequelize,
                modelName: 'CartItem',
                tableName: 'cart_items',
                timestamps: true,
                underscored: true
            }
        )
        return CartItem;
    }

    static associate(models){
        CartItem.belongsTo(models.Cart, {
            foreignKey: 'cartId',
            as: 'cart'
        });

        CartItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        });
    }
}

module.exports = CartItem;