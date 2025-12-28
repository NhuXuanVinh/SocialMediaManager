const { Workspace, WorkspaceMember } = require('../models');

exports.getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user.userId;

    const workspaces = await Workspace.findAll({
      include: [
        {
          model: WorkspaceMember,
          where: { user_id: userId },
          attributes: ['role'],
        },
      ],
    });

    res.json(workspaces);
  } catch (err) {
    console.error('[Get Workspaces]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
