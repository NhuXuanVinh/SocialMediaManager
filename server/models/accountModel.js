// models/Account.js
module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define('Account', {
        account_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          workspace_id: {                // ✅ ADD THIS
            type: DataTypes.INTEGER,
            allowNull: false,
            },
        platform: DataTypes.STRING,
        account_name: DataTypes.STRING,
        account_url: DataTypes.STRING,
    },
    {
      tableName: 'accounts', // 👈 lowercase table name
    }
);

    Account.associate = (models) => {
        // One-to-many relationship between accounts and platform-specific tables
        // Account.hasOne(models.YouubeAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.TwitterAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.FacebookAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.LinkedinAccount, {foreignKey: 'account_id'});
        Account.hasOne(models.InstagramAccount, { foreignKey: 'account_id' });
        
        Account.hasMany(models.Post, { foreignKey: 'account_id' });
        Account.belongsTo(models.Workspace, {
      foreignKey: 'workspace_id',
    });

        // Many-to-many relationship between accounts and groups
        Account.belongsToMany(models.Group, { through: models.AccountGroup, foreignKey: 'account_id' });
    };

    return Account;
};
