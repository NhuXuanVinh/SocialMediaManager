const { Account, Post, Tag } = require('../models');

const getAccountsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const accounts = await Account.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Post,
          include: [
            {
              model: Tag,
              through: { attributes: [] }, // 👈 hide PostTag join table
              attributes: ['tag_id', 'name', 'color'],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      accounts: accounts || [],
    });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({
      message: 'Error fetching accounts',
    });
  }
};

module.exports = {
  getAccountsByUser,
};
