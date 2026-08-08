const {DataTypes, Model} = require("sequelize");

class SystemConfig extends Model{
    static initModel(sequelize){
        SystemConfig.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: UUIDV4,
                    primaryKey: true
                },
                key: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true
                },
                value: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
            },
            {
                sequelize,
                modelName: 'SystemConfig',
                tableName: 'system_configs',
                underscored: true,
                timestamps: true
            }
        );
        return SystemConfig;
    }

    static associate(models){
        
    }
}

module.exports = SystemConfig;