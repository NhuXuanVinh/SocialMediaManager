// models/PostInsight.js
module.exports = (sequelize, DataTypes) => {
  const PostInsight = sequelize.define(
    'PostInsight',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // 🔗 Relations
      post_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      platform: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },

      post_platform_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // 📊 Metrics
      impressions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      shares: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      captured_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'post_insights',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          fields: ['post_id'],
        },
        {
          fields: ['platform', 'post_platform_id'],
        },
        {
          fields: ['captured_at'],
        },
      ],
    }
  );

  PostInsight.associate = (models) => {
    PostInsight.belongsTo(models.Post, {
      foreignKey: 'post_id',
    });

  };

  return PostInsight;
};
