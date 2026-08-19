const { DataTypes, Model } = require("sequelize");

class Product extends Model
{
    static initModel(sequelize)
    {
        Product.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                sku: {
                    type: DataTypes.STRING(50),
                    unique: true,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    validate: {
                        len: [2, 100]
                    },
                    set(value)
                    {
                        this.setDataValue("name", value.trim());
                    }
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0.01
                    }
                },
                stockQuantity: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    validate: {
                        min: 0
                    }
                },
                categoryId: {
                    type: DataTypes.UUID,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Product',
                tableName: 'products',
                timestamps: true,
                underscored: true,
                paranoid: true
            }
        )
        return Product;
    }

    static associate(models)
    {
        Product.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category'
        });

        Product.hasMany(models.CartItem, {
            foreignKey: 'productId',
            as: 'cartItems'
        });

        Product.hasMany(models.OrderItem, {
            foreignKey: 'productId',
            as: 'orderItems'
        });

        Product.hasMany(models.ProductImage, {
            foreignKey: 'productId',
            as: 'images'
        });
    }
}

module.exports = Product;