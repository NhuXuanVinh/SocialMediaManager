const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Import model files
const User = require('./userModel')(sequelize, DataTypes);
const Account = require('./accountModel')(sequelize, DataTypes);
const Group = require('./groupModel')(sequelize, DataTypes);
const AccountGroup = require('./accountGroupModel')(sequelize, DataTypes);
// const YouTubeAccount = require('./YouTubeAccount')(sequelize, DataTypes);
const TwitterAccount = require('./twitterAccountModel')(sequelize, DataTypes);
const FacebookAccount = require('./facebookAccountModel')(sequelize, DataTypes);
const LinkedinAccount = require('./linkedinAccountModel')(sequelize, DataTypes);
const Post = require('./postModel')(sequelize, DataTypes);
const Tag = require('./Tag')(sequelize, DataTypes);
const PostTag = require('./PostTag')(sequelize, DataTypes);

// Set up associations
User.associate({ Account, Group });
Account.associate({TwitterAccount, LinkedinAccount, FacebookAccount, Group, AccountGroup, Post});
Group.associate({ Account, User, AccountGroup });
AccountGroup.associate({ Account, Group });
TwitterAccount.associate({ Account });
LinkedinAccount.associate({ Account });
FacebookAccount.associate({Account});
Post.associate({ Account, Tag, PostTag, }); 
Tag.associate({ Post, PostTag, });
// Export all models and Sequelize instance for use elsewhere
module.exports = {
    User,
    Account,
    Group,
    AccountGroup,
    // YouTubeAccount,
    TwitterAccount,
    FacebookAccount,
    LinkedinAccount,
    Post,
    Tag,
    PostTag,
    sequelize,
};
