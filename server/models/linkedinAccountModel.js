// models/TwitterAccount.js
module.exports = (sequelize, DataTypes) => {
    const LinkedinAccount = sequelize.define('LinkedinAccount', {
        account_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        linkedin_user_id: {
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
      tableName: 'linkedin_accounts', // 👈 lowercase table name
    }
);

    // Declare associations
    LinkedinAccount.associate = (models) => {
        // A Twitter account belongs to an Account
        LinkedinAccount.belongsTo(models.Account, { foreignKey: 'account_id' });
    };

    return LinkedinAccount;
};
