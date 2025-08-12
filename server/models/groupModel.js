// models/Group.js
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        group_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: DataTypes.INTEGER,
        group_name: DataTypes.STRING,
    });

    Group.associate = (models) => {
        // Many-to-many relationship between groups and accounts
        Group.belongsToMany(models.Account, { through: models.AccountGroup, foreignKey: 'group_id' });

        // One-to-many relationship between users and groups
        Group.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Group;
};
