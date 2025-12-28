module.exports = (sequelize, DataTypes) => {
	const Post = sequelize.define(
	  'Post',
	  {
		post_id: {
		  type: DataTypes.INTEGER,
		  primaryKey: true,
		  autoIncrement: true,
		},
		post_platform_id: {
			type: DataTypes.STRING,
		},
		post_link: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		content: {
		  type: DataTypes.TEXT,
		  allowNull: false, // Content is required
		},
		scheduledAt: {
		  type: DataTypes.DATE,
		  allowNull: true, // Optional for instant posts
		},
		status: {
		  type: DataTypes.STRING,
		  allowNull: true,
		},
	  },
	      {
      tableName: 'posts', // 👈 lowercase table name
    }
	);
  
	// Define associations
  Post.associate = (models) => {
    // belongs to Account
    Post.belongsTo(models.Account, {
      foreignKey: 'account_id',
    });

    // many-to-many with Tag
    Post.belongsToMany(models.Tag, {
      through: models.PostTag,
      foreignKey: 'post_id',
      otherKey: 'tag_id',
    });

	Post.hasMany(models.PostMedia, { foreignKey: 'post_id' });

	Post.hasMany(models.PostInsight, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE',
});
  };

  
	return Post;
  };
  