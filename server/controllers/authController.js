const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../dist/orm/data-source');
const { User } = require('../dist/entities/user.entity');
async function getUserRepo() {
  await AppDataSource.initialize().catch(() => {});
  return AppDataSource.getRepository(User);
}

// Register user
const registerUser = async (req, res) => {
  const {email, username, password } = req.body;

  // Check if the user already exists
  const userRepo = await getUserRepo();
  const userExists = await userRepo.findOne({ where: { username } });
  if (userExists) return res.status(400).json({ message: 'User already exists' });
  const emailExists = await userRepo.findOne({ where: { email } });
  if(emailExists) return res.status(400).json({ message: 'Email already used' });


  try {
    const user = userRepo.create({ email, username, password });
    await userRepo.save(user);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  const userRepo = await getUserRepo();
  const user = await userRepo.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'User does not exist' });

  const passwordCorrect = await user.isValidPassword(password);
  if (!passwordCorrect) return res.status(400).json({ message: 'Wrong password' });

  // Generate JWT token
  const payload = { userId: user.id, username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

  res.json({ token: token });
};

module.exports = { registerUser, loginUser };
