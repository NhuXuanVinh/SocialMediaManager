// models/InstagramAccount.js
module.exports = (sequelize, DataTypes) => {
    const InstagramAccount = sequelize.define('InstagramAccount', {
        account_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        instagram_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,  
        },
        access_token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
      tableName: 'instagram_accounts', // 👈 lowercase table name
    }
);

    // Declare associations
    InstagramAccount.associate = (models) => {
        // An Instagram account belongs to an Account
        InstagramAccount.belongsTo(models.Account, { foreignKey: 'account_id' });
    };

    return InstagramAccount;
};
