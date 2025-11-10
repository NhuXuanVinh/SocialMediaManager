
module.exports = (sequelize, DataTypes) => {
    const FacebookAccount = sequelize.define('FacebookAccount', {
        account_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        facebook_user_id: {
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
    });

    // Declare associations
    FacebookAccount.associate = (models) => {
        // A Twitter account belongs to an Account
        FacebookAccount.belongsTo(models.Account, { foreignKey: 'account_id' });
    };

    return FacebookAccount;
};
