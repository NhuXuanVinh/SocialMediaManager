const { Workspace, WorkspaceMember, User,  Account,
  Group,
  Post,
  Tag,
  PostMedia, } = require('../models');

/* -----------------------------------
   GET /workspaces/:workspaceId/members
------------------------------------ */
const getWorkspaceMembers = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.userId; // from auth middleware

  try {
    // ✅ Check membership
    const membership = await WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ Fetch members
    const members = await WorkspaceMember.findAll({
      where: { workspace_id: workspaceId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return res.json({
      members: members.map(m => ({
        id: m.id,
        role: m.role,
        user: m.User,
      })),
    });

  } catch (err) {
    console.error('[Get Workspace Members]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* -----------------------------------
   POST /workspaces/:workspaceId/members
------------------------------------ */
const addWorkspaceMember = async (req, res) => {
  const { workspaceId } = req.params;
  const { userIdentifier, role } = req.body;
  const requesterId = req.user.userId;

  try {
    // ✅ Check requester role
    const requesterMembership = await WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: requesterId },
    });
    if (!requesterMembership) {
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Requester membership found:', requesterMembership.role);
    if (!['owner', 'admin'].includes(requesterMembership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    console.log('Requester role verified');
    // ❌ Only owner can assign owner
    if (role === 'owner' && requesterMembership.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can assign owner role' });
    }

    // ✅ Find user (email or ID)
    const user = await User.findOne({
      where: isNaN(userIdentifier)
        ? { email: userIdentifier }
        : { id: userIdentifier },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ❌ Prevent duplicate
    const existing = await WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: user.id },
    });

    if (existing) {
      return res.status(400).json({ message: 'User already in workspace' });
    }

    // ✅ Add member
    const member = await WorkspaceMember.create({
      workspace_id: workspaceId,
      user_id: user.id,
      role,
    });

    return res.status(201).json({
      message: 'Member added',
      member: {
        id: member.id,
        role: member.role,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });

  } catch (err) {
    console.error('[Add Workspace Member]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getAccountsByWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.userId;

  try {
    // ✅ Check membership
    const membership = await WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ Fetch accounts + posts
    const accounts = await Account.findAll({
      where: { workspace_id: workspaceId },
      include: [
        {
          model: Post,
          include: [Tag, PostMedia],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ accounts });
  } catch (err) {
    console.error('[Get Accounts By Workspace]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ----------------------------------------
   GET /workspaces/:workspaceId/groups
----------------------------------------- */
const getGroupsByWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.userId;

  try {
    // ✅ Check membership
    const membership = await WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ Fetch groups + accounts
    const groups = await Group.findAll({
      where: { workspace_id: workspaceId },
      include: [Account],
      order: [['createdAt', 'ASC']],
    });

    return res.json({ groups });
  } catch (err) {
    console.error('[Get Groups By Workspace]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await WorkspaceMember.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Workspace,
          attributes: ['id', 'name', 'owner_id'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const workspaces = memberships.map(m => ({
      id: m.Workspace.id,
      name: m.Workspace.name,
      role: m.role,
      ownerId: m.Workspace.owner_id,
    }));

    return res.status(200).json({ workspaces });
  } catch (err) {
    console.error('[Get My Workspaces]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyWorkspaceRole = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT middleware
    const { workspaceId } = req.params;

    // ✅ Validate params BEFORE hitting DB
    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ message: 'Invalid workspaceId' });
    }

    const membership = await WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
      },
      include: [{ model: Workspace }],
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    return res.json({
      workspace: {
        id: membership.workspace_id,
        name: membership.Workspace.name,
      },
      role: membership.role,
    });
  } catch (err) {
    console.error('[Get My Workspace Role]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    if (!['admin', 'publisher', 'editor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find member
    const member = await WorkspaceMember.findOne({
      where: {
        id: memberId,
        workspace_id: workspaceId,
      },
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // 🚫 Prevent changing owner role
    if (member.role === 'owner') {
      return res.status(403).json({
        message: 'Cannot change owner role',
      });
    }

    // 🚫 Prevent self-demotion (optional but recommended)
    if (member.user_id === req.user.userId) {
      return res.status(403).json({
        message: 'You cannot change your own role',
      });
    }

    await member.update({ role });

    res.json({
      message: 'Role updated successfully',
      member: {
        id: member.id,
        role: member.role,
      },
    });
  } catch (err) {
    console.error('[Update Member Role]', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const currentUserId = req.user.userId;

    const member = await WorkspaceMember.findOne({
      where: {
        id: memberId,
        workspace_id: workspaceId,
      },
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // 🚫 Cannot remove owner
    if (member.role === 'owner') {
      return res.status(403).json({
        message: 'Owner cannot be removed',
      });
    }

    // 🚫 Prevent self-removal
    if (member.user_id === currentUserId) {
      return res.status(403).json({
        message: 'You cannot remove yourself',
      });
    }

    await member.destroy();

    res.json({
      message: 'Member removed successfully',
    });
  } catch (err) {
    console.error('[Remove Member]', err);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};


module.exports = {
  getWorkspaceMembers,
  addWorkspaceMember,
  getAccountsByWorkspace,
  getGroupsByWorkspace,
  getMyWorkspaces,
  getMyWorkspaceRole,
  updateMemberRole,
  removeMember,
};
