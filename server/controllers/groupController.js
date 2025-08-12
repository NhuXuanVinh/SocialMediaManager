const { Group, Account, AccountGroup, Post } = require('../models');
const { get } = require('../routes/twitterRoutes');

// Create a new group
const createGroup = async (req, res) => {
  const { userId, name } = req.body;
  try {
    // Create the new group
    const group = await Group.create({user_id: userId, group_name: name });

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating group' });
  }
};

// Add an Account to a Group
const addAccountToGroup = async (req, res) => {
  const { groupId, accountId } = req.body;

  try {
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the account exists
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Add the account to the group using the AccountGroup (junction table)
    await AccountGroup.create({ account_id: accountId, group_id: groupId });
    res.status(200).json({ message: 'Account added to group successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding account to group' });
  }
};

// Remove an Account from a Group
const removeAccountFromGroup = async (req, res) => {
  const { groupId, accountId } = req.body;

  try {
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the account exists
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Remove the account from the group
    const record = await AccountGroup.findOne({ where: { account_id: accountId, group_id: groupId } });
    if (!record) {
      return res.status(404).json({ message: 'Account not found in this group' });
    }

    await record.destroy();
    res.status(200).json({ message: 'Account removed from group successfully' });
  } catch (err) {
    console.error(err);
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
module.exports = { createGroup, addAccountToGroup, removeAccountFromGroup,getGroupsByUser, getGroupById };
