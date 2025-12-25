// models/AccountGroup.js
module.exports = (sequelize, DataTypes) => {
    const AccountGroup = sequelize.define('AccountGroup', {
        account_id: { type: DataTypes.INTEGER, primaryKey: true },
        group_id: { type: DataTypes.INTEGER, primaryKey: true },
        
    },
    {
      tableName: 'account_groups', // 👈 lowercase table name
      timestamps: false,           // 👈 recommended for join tables
    }
);

    AccountGroup.associate = (models) => {
        // Each account group belongs to an account and a group
        AccountGroup.belongsTo(models.Account, { foreignKey: 'account_id' });
        AccountGroup.belongsTo(models.Group, { foreignKey: 'group_id' });
    };
    

    return AccountGroup;
};
