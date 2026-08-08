const {DataTypes, Model} = require("sequelize");

class Cart extends Model{
    static initModel(sequelize){
        Cart.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.UUID,
                    unique: true,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Cart',
                tableName: 'carts',
                timestamps: true,
                underscored: true
            }
        )
        return Cart;
    }

    static associate(models){
        Cart.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        Cart.hasMany(models.CartItem, {
            foreignKey: 'cartId', 
            as: 'items'
        });
    }
}
module.exports = Cart;