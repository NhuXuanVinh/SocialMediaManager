// models/Group.js
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        group_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        group_name: DataTypes.STRING,
              workspace_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: 'groups', // 👈 lowercase table name
    }
);

    Group.associate = (models) => {
        // Many-to-many relationship between groups and accounts
        Group.belongsToMany(models.Account, { through: models.AccountGroup, foreignKey: 'group_id' });
            Group.belongsTo(models.Workspace, {
            foreignKey: 'workspace_id',
            });

    };

    return Group;
};
