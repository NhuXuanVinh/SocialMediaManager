module.exports = (sequelize, DataTypes) => {
  const PostMedia = sequelize.define(
    'PostMedia',
    {
      media_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      public_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM('image', 'video'),
        defaultValue: 'image',
      },

      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      format: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'post_media',
      timestamps: true,
      underscored: true,
    }
  );

  PostMedia.associate = (models) => {
    PostMedia.belongsTo(models.Post, {
      foreignKey: 'post_id',
      onDelete: 'CASCADE',
    });
  };

  return PostMedia;
};
