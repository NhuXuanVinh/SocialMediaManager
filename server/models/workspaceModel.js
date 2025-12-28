module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    tableName: 'workspaces',
    timestamps: true,
  });

  Workspace.associate = (models) => {
    Workspace.hasMany(models.WorkspaceMember, {
      foreignKey: 'workspace_id',
    });

    Workspace.hasMany(models.Account, {
      foreignKey: 'workspace_id',
    });
  };

  return Workspace;
};
