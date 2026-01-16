module.exports = (sequelize, DataTypes) => {
  const WorkspaceMember = sequelize.define('WorkspaceMember', {
    id: {
  type: DataTypes.BIGINT,
  primaryKey: true,
  autoIncrement: true,
},
    workspace_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'owner',
        'admin',
        'publisher',
        'editor'
      ),
      allowNull: false,
    },
  }, {
    tableName: 'workspace_members',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['workspace_id', 'user_id'] },
    ],
  });

  WorkspaceMember.associate = (models) => {
    WorkspaceMember.belongsTo(models.Workspace, {
      foreignKey: 'workspace_id',
    });
    WorkspaceMember.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };

  return WorkspaceMember;
};
