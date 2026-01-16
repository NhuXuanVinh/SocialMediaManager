module.exports = (sequelize, DataTypes) => {
  const TwitterOAuthRequest = sequelize.define(
    'TwitterOAuthRequest',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      oauth_token: { type: DataTypes.STRING, allowNull: false, unique: true },
      oauth_token_secret: { type: DataTypes.STRING, allowNull: false },

      workspace_id: { type: DataTypes.INTEGER, allowNull: false },

      expires_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: 'twitter_oauth_requests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return TwitterOAuthRequest;
};
