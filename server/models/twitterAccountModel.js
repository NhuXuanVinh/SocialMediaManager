// models/TwitterAccount.js
module.exports = (sequelize, DataTypes) => {
    const TwitterAccount = sequelize.define('TwitterAccount', {
        account_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        twitter_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,  
        },
        access_token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        access_token_secret: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
      tableName: 'twitter_accounts', // 👈 lowercase table name
    }
);

    // Declare associations
    TwitterAccount.associate = (models) => {
        // A Twitter account belongs to an Account
        TwitterAccount.belongsTo(models.Account, { foreignKey: 'account_id' });
    };

    return TwitterAccount;
};
