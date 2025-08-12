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
	);
  
	// Define associations
	Post.associate = (models) => {
	  // Each post belongs to one account
	  Post.belongsTo(models.Account, { foreignKey: 'account_id' });
	};
  
	return Post;
  };
  