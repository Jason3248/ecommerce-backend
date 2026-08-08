const {DataTypes, Model} = require("sequelize");

class Category extends Model{
    static initModel(sequelize){
        Category.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    validate: {
                        len: [2, 100]
                    },
                    set(value){
                        this.setDataValue("name", value.trim());
                    }
                },
            },
            {
                sequelize,
                modelName: 'Category',
                tableName: 'categories',
                timestamps: true,
                underscored: true,
                paranoid: true
            }
        )
        return Category;
    }

    static associate(models){
        Category.hasMany(models.Product, {
            foreignKey: 'categoryId',
            as: 'products'
        });

        
    }
}
module.exports = Category;