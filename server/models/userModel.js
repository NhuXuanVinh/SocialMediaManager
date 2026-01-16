const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
      {
      tableName: 'users', // 👈 lowercase table name
    }
);

  // Associations
  User.associate = (models) => {
    // One-to-many relationship between users and accounts
    User.hasMany(models.Account, { foreignKey: 'user_id' });

    // Many-to-many relationship between users and groups
    User.hasMany(models.Group, { foreignKey: 'user_id' });

    
   User.hasMany(models.WorkspaceMember, {
      foreignKey: 'user_id',
    });
  };


  // Hash password before saving the user to the database
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  // Method to check if the password matches
  User.prototype.isValidPassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
