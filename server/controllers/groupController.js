const { AppDataSource } = require('../dist/orm/data-source');
const { Group } = require('../dist/entities/group.entity');
const { Account } = require('../dist/entities/account.entity');
const { AccountGroup } = require('../dist/entities/account-group.entity');
const { Post } = require('../dist/entities/post.entity');
const { get } = require('../routes/twitterRoutes');

// Create a new group
const createGroup = async (req, res) => {
  const { userId, name } = req.body;
  try {
    // Create the new group
    await AppDataSource.initialize().catch(() => {});
    const groupRepo = AppDataSource.getRepository(Group);
    const group = groupRepo.create({ group_name: name, user: { id: userId } });
    await groupRepo.save(group);

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
    const groupRepo2 = AppDataSource.getRepository(Group);
    const accountRepo2 = AppDataSource.getRepository(Account);
    const joinRepo2 = AppDataSource.getRepository(AccountGroup);
    const group = await groupRepo2.findOne({ where: { groupId } });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the account exists
    const account = await accountRepo2.findOne({ where: { accountId } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Add the account to the group using the AccountGroup (junction table)
    const join = joinRepo2.create({ account_id: accountId, group_id: groupId });
    await joinRepo2.save(join);
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
    const groupRepo3 = AppDataSource.getRepository(Group);
    const accountRepo3 = AppDataSource.getRepository(Account);
    const joinRepo3 = AppDataSource.getRepository(AccountGroup);
    const group = await groupRepo3.findOne({ where: { groupId } });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the account exists
    const account = await accountRepo3.findOne({ where: { accountId } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Remove the account from the group
    const record = await joinRepo3.findOne({ where: { account_id: accountId, group_id: groupId } });
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
    const groupRepo4 = AppDataSource.getRepository(Group);
    const groups = await groupRepo4.find({
      where: { user: { id: userId } },
      relations: ['accounts', 'accounts.posts'],
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
    const groupRepo5 = AppDataSource.getRepository(Group);
    const group = await groupRepo5.findOne({
      where: { groupId },
      relations: ['accounts', 'accounts.posts'],
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
