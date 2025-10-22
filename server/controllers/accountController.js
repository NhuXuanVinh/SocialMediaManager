const { AppDataSource } = require('../dist/orm/data-source');
const { Account } = require('../dist/entities/account.entity');
const { Post } = require('../dist/entities/post.entity');
const getAccountsByUser = async (req, res) => {
	const { userId } = req.params;
  
	try {
  await AppDataSource.initialize().catch(() => {});
  const accountRepo = AppDataSource.getRepository(Account);
  const accounts = await accountRepo.find({
    where: { user: { id: userId } },
    relations: ['posts'],
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