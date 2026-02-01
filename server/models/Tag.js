module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
    {
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      workspace_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. '#1890ff' or 'blue'
        validate: {
          len: [3, 20], // supports hex or color names
        },
      },
    },
    {
      tableName: 'tags',
      timestamps: false,
    }
  );

  Tag.associate = (models) => {

        Tag.belongsTo(models.Workspace, {
      foreignKey: 'workspace_id',
      onDelete: 'CASCADE',
    });


    Tag.belongsToMany(models.Post, {
      through: models.PostTag,
      foreignKey: 'tag_id',
      otherKey: 'post_id',
      targetKey: 'post_id',
    });

    // ✅ required for usageCount query
    Tag.hasMany(models.PostTag, {
      foreignKey: 'tag_id',
    });
  };

  

  return Tag;
};
