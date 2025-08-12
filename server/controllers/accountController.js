const { Group, Account, AccountGroup, Post } = require('../models');
const getAccountsByUser = async (req, res) => {
	const { userId } = req.params;
  
	try {
	  const accounts = await Account.findAll({
		where: { user_id: userId },
		include: [
            {
              model: Post, // Include associated Post model for each Account
            },
          ], // Filter accounts by user ID
	  });
  
	  res.status(200).json({ accounts: accounts||[] });
	} catch (err) {
	  console.error('Error fetching accounts:', err);
	  res.status(500).json({ message: 'Error fetching accounts' });
	}
  };
module.exports = {
	getAccountsByUser,
}