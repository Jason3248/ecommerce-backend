const { Model, DataTypes, INTEGER } = require("sequelize");


class ProductImage extends Model
{
    static initModel(sequelize)
    {
        ProductImage.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                productId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                imageUrl: {
                    type: DataTypes.STRING(500),
                    allowNull: false
                },
                publicId: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                fileName: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                mimeType: {
                    type: DataTypes.STRING(50),
                    allowNull: false
                },
                size: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 0
                    }
                }
            },
            {
                sequelize,
                modelName: 'ProductImage',
                tableName: 'product_images',
                underscored: true,
                timestamps: true
            }
        );
        return ProductImage;
    }

    static associate(models)
    {
        ProductImage.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        });
    }

}

module.exports = ProductImage;