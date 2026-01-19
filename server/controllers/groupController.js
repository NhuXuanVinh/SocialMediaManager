const { Group, Account, AccountGroup, Post, Tag, PostMedia } = require('../models');
// const {fetchFacebookInsightsTest} = require('../services/facebookService');
// const {fetchTwitterInsightsTest} = require('../services/twitterService');
// const {fetchInstagramInsightsTest} = require('../services/instagramService');
// Create a new group
const createGroup = async (req, res) => {
  const { workspaceId } = req.params;
  const { group_name } = req.body;

  if (!group_name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
    const group = await Group.create({
      group_name,
      workspace_id: workspaceId,
    });

    return res.status(201).json({ group });
  } catch (err) {
    console.error('[CreateGroup]', err);
    return res.status(500).json({ message: 'Failed to create group' });
  }
};

// Add an Account to a Group
const addAccountToGroup = async (req, res) => {
  const { groupId, accountId } = req.params;
  console.log('Adding account to group:', groupId, accountId);
  try {
    // 1️⃣ Find group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 2️⃣ Find account
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // 3️⃣ Ensure SAME workspace
    if (Number(group.workspace_id) !== Number(account.workspace_id)) {
      console.log('Workspace mismatch:', group.workspace_id, account.workspace_id);
      return res.status(403).json({
        message: 'Account and group belong to different workspaces',
      });
    }

    // 4️⃣ Prevent duplicates
    const exists = await AccountGroup.findOne({
      where: {
        group_id: groupId,
        account_id: accountId,
      },
    });

    if (exists) {
      return res.status(400).json({ message: 'Account already in group' });
    }

    // 5️⃣ Create relation
    await AccountGroup.create({
      group_id: groupId,
      account_id: accountId,
    });
    // fetchFacebookInsightsTest()
    // fetchInstagramInsightsTest()
    return res.status(200).json({ message: 'Account added to group successfully' });
  } catch (err) {
    console.error('[AddAccountToGroup]', err);
    return res.status(500).json({ message: 'Error adding account to group' });
  }
};


// Remove an Account from a Group
const removeAccountFromGroup = async (req, res) => {
  const { groupId, accountId } = req.params;

  try {
    // 1️⃣ Find group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 2️⃣ Find account
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // 3️⃣ Ensure SAME workspace
    if (Number(group.workspace_id) !== Number(account.workspace_id)) {
      return res.status(403).json({
        message: 'Account and group belong to different workspaces',
      });
    }

    // 4️⃣ Find junction record
    const record = await AccountGroup.findOne({
      where: {
        group_id: groupId,
        account_id: accountId,
      },
    });

    if (!record) {
      return res
        .status(404)
        .json({ message: 'Account not found in this group' });
    }

    // 5️⃣ Remove relation
    await record.destroy();

    res.status(200).json({ message: 'Account removed from group successfully' });
  } catch (err) {
    console.error('[RemoveAccountFromGroup]', err);
    res.status(500).json({ message: 'Error removing account from group' });
  }
};


const getGroupsByUser = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a route parameter
  try {
    // Find all groups belonging to the user
    const groups = await Group.findAll({
      where: { user_id: userId }, // Filter groups by userId
      include: [
        {
          model: Account, // Include associated Account model
          through: { attributes: [] }, // Exclude junction table attributes
          include: [
            {
              model: Post, // Include associated Post model for each Account
            },
          ],
        },
      ],
    });
    // if (!groups || groups.length === 0) {
    //   return res.status(404).json({ message: 'No groups found for this user' });
    // }
    
    // Return the groups and their associated accounts
    res.status(200).json({ groups: groups || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching groups for user' });
  }
};

const getGroupById = async (req, res) => {
  const { groupId } = req.params; // Assuming userId is passed as a route parameter
  try {
    // Find all groups belonging to the user
    const group = await Group.findOne({
      where: { group_id: groupId },// Filter groups by userId
      include: [
        {
          model: Account, // Include associated Account model
          through: { attributes: [] }, // Exclude junction table attributes
          include: [
            {
              model: Post, // Include associated Post model for each Account
            },
          ],
        },
      ],
    });
    // if (!groups || groups.length === 0) {
    //   return res.status(404).json({ message: 'No groups found for this user' });
    // }
    
    // Return the groups and their associated accounts
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ group: group });
}
catch (error) {
  console.error('Error fetching group:', error);
  res.status(500).json({ message: 'Server error', error });
}
}

const getAccountsByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    // 1️⃣ Find group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 2️⃣ Fetch accounts in group
    const accounts = await Account.findAll({
      include: [
        {
          model: Group,
          where: { group_id: groupId },
          through: { attributes: [] },
        },
        {
          model: Post,
          include: [
            {
              model: Tag,
              through: { attributes: [] },
            },
            {
              model: PostMedia,
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return res.status(200).json({ accounts });
  } catch (err) {
    console.error('[GetAccountsByGroup]', err);
    return res.status(500).json({ message: 'Failed to fetch accounts' });
  }
};


const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const role = req.workspace.role; // injected by middleware
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    // ✅ permission: only publisher/admin/owner can delete groups
    const allow = ['admin', 'owner'].includes(role);
    if (!allow) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // ✅ find group (and confirm workspace)
    const group = await Group.findOne({
      where: {
        group_id: groupId,
        workspace_id: workspaceId,
      },
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // ✅ remove join table rows (GroupAccount or GroupAccounts depending on your naming)
    await AccountGroup.destroy({
      where: { group_id: groupId },
    });

    // ✅ delete group
    await group.destroy();

    return res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (err) {
    console.error('[deleteGroup]', err);
    return res.status(500).json({ message: 'Failed to delete group' });
  }
};
module.exports = { createGroup, addAccountToGroup, removeAccountFromGroup,getGroupsByUser, getGroupById, getAccountsByGroup, deleteGroup };
