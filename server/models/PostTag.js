module.exports = (sequelize, DataTypes) => {
  const PostTag = sequelize.define(
    'PostTag',
    {
      post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'post_id',
        },
      },
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'tag_id',
        },
      },
    },
    {
      tableName: 'post_tags',
      timestamps: false,
    }
  );

  return PostTag;
};
