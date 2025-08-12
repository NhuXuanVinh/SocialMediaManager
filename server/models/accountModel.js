// models/Account.js
module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define('Account', {
        account_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: DataTypes.INTEGER,
        platform: DataTypes.STRING,
        account_name: DataTypes.STRING,
        account_url: DataTypes.STRING,
    });

    Account.associate = (models) => {
        // One-to-many relationship between accounts and platform-specific tables
        // Account.hasOne(models.YouTubeAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.TwitterAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.FacebookAccount, { foreignKey: 'account_id' });
        Account.hasOne(models.LinkedinAccount, {foreignKey: 'account_id'});
        
        Account.hasMany(models.Post, { foreignKey: 'account_id' });

        // Many-to-many relationship between accounts and groups
        Account.belongsToMany(models.Group, { through: models.AccountGroup, foreignKey: 'account_id' });
    };

    return Account;
};
