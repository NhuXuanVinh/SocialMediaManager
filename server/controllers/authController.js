const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sequelize, User, Workspace, WorkspaceMember } = require('../models');


// Register user (UNCHANGED)
const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ Check uniqueness
    const userExists = await User.findOne({
      where: { username },
      transaction,
    });
    if (userExists) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Username already exists' });
    }

    const emailExists = await User.findOne({
      where: { email },
      transaction,
    });
    if (emailExists) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already used' });
    }

    // 2️⃣ Create user (password will be hashed by hook)
    const user = await User.create(
      {
        username,
        password, // 👈 plain password, hook hashes it
        email,
      },
      { transaction }
    );

    // 3️⃣ Create workspace
    const workspace = await Workspace.create(
      {
        name: `${username}'s Workspace`,
        owner_id: user.id,
      },
      { transaction }
    );

    // 4️⃣ Add workspace member (owner)
    await WorkspaceMember.create(
      {
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      workspaceId: workspace.id,
    });

  } catch (err) {
    await transaction.rollback();
    console.error('[Register]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ✅ LOGIN USER (COOKIE-BASED)
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'User does not exist' });

  const passwordCorrect = await user.isValidPassword(password);
  if (!passwordCorrect) return res.status(400).json({ message: 'Wrong password' });

  const payload = { userId: user.id, username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '5h',
  });

  
  // ✅ SET TOKEN IN COOKIE
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,          // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });

  const ownerWorkspace = await WorkspaceMember.findOne({
    where: {
      user_id: user.id,
      role: 'owner',
    },
    include: [{ model: Workspace }],
  });

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
    },
    workspace: ownerWorkspace
      ? {
          id: ownerWorkspace.Workspace.id,
          name: ownerWorkspace.Workspace.name,
          role: ownerWorkspace.role,
        }
      : null,
  });
};

module.exports = { registerUser, loginUser };
