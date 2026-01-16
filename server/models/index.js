const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const twitterAccountModel = require('./twitterAccountModel');

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
const PostMedia = require('./postMediaModel')(sequelize, DataTypes);
const PostInsight = require('./postInsightModel')(sequelize, DataTypes);   
const Workspace = require('./workspaceModel')(sequelize, DataTypes);
const WorkspaceMember = require('./workspaceMemberModel')(sequelize, DataTypes);
const InstagramAccount = require('./instagramAccountModel')(sequelize, DataTypes);
const TwitterOAuthRequest = require('./twitterOAuthRequestModel')(sequelize, DataTypes);


// Define associations between models 

// Set up associations
User.associate({ Account, Group, WorkspaceMember });
Account.associate({TwitterAccount, LinkedinAccount, FacebookAccount, Group, AccountGroup, Post, Workspace, InstagramAccount});
Group.associate({ Account, User, AccountGroup, Workspace });
AccountGroup.associate({ Account, Group });
TwitterAccount.associate({ Account });
LinkedinAccount.associate({ Account });
FacebookAccount.associate({Account});
InstagramAccount.associate({ Account });
Post.associate({ Account, Tag, PostTag, PostMedia, PostInsight }); 
Tag.associate({ Post, PostTag, Workspace });
PostMedia.associate({ Post });
PostInsight.associate({ Post });
Workspace.associate({ WorkspaceMember, Account, Group, Tag });
WorkspaceMember.associate({ Workspace, User });
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
    InstagramAccount,
    Post,
    Tag,
    PostTag,
    PostMedia,
    PostInsight,
    sequelize,
    Workspace,
    WorkspaceMember,
    TwitterOAuthRequest,
};
