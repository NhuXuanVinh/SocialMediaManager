const { WorkspaceMember } = require('../models');

const requireWorkspaceRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    const userId = req.user.userId;
        const rawWorkspaceId =
      req.body?.workspaceId ?? req.params?.workspaceId ?? req.query?.workspaceId;
    const workspaceId = Number(rawWorkspaceId);
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    const membership = await WorkspaceMember.findOne({
      where: {
        user_id: userId,
        workspace_id: workspaceId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // ✅ attach role to request
    req.workspace = {
      id: workspaceId,
      role: membership.role,
    };

    next();
  };
};

module.exports = requireWorkspaceRole;
