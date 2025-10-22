
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { AppDataSource } = require('../dist/orm/data-source');
const { Post } = require('../dist/entities/post.entity');
const { FacebookAccount } = require('../dist/entities/facebook-account.entity');
require('dotenv').config();

// Route to handle posting to Facebook page
const postToFacebook =  async (req, res) => {
	const accountId = req.body.accountId
	const text = req.body.text
	const files = req.body.files
    await AppDataSource.initialize().catch(() => {});
    const fbRepo = AppDataSource.getRepository(FacebookAccount);
    const postRepo = AppDataSource.getRepository(Post);
    const facebookAccount = await fbRepo.findOne({ where: { account: { accountId } } });
	if (!facebookAccount) {
		return res.status(400).send('LinkedIn account not found for the user.');
	}
	const page_id = facebookAccount.facebook_user_id
	const access_token = facebookAccount.access_token
    try {
        const photoIds = [];

        // Upload each image with `published: false`
        if (files && files.length > 0) {
            for (const file of files) {
                const formData = new FormData();
                const imageBuffer = fs.readFileSync(file.path); // Read the image file as a Buffer
                formData.append('source', imageBuffer, {
                    filename: file.originalname,
                    contentType: file.mimetype,
                });
                formData.append('published', 'false'); // Prevent immediate publishing

                const photoResponse = await axios.post(
                    `https://graph.facebook.com/v12.0/${page_id}/photos`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(), // Add headers for multipart/form-data
                            Authorization: `Bearer ${access_token}`,
                        },
                    }
                );

                photoIds.push(photoResponse.data.id); // Collect photo IDs
            }
        }

        // Create a post referencing the uploaded images
        const postBody = {
            message: text,
            attached_media: photoIds.map((id) => ({ media_fbid: id })), // Attach media IDs
        };

        const postResponse = await axios.post(
            `https://graph.facebook.com/v12.0/${page_id}/feed`,
            postBody,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        const postPlatformId = postResponse.data.id;
        const postLink = `https://www.facebook.com/${postPlatformId}`;

        // Save the post to the database
        const newPost = postRepo.create({
            post_platform_id: postPlatformId,
            post_link: postLink,
            content: text,
            scheduledAt: null,
            status: 'posted',
            account: { accountId },
        });
        await postRepo.save(newPost);
        console.log('Post with multiple images successful:', postResponse.data);
        // res.json({ success: true, message: 'Post created successfully!' });
        // res.send('Post was successful! <a href="/">Go back</a>');
    } catch (error) {
        console.error('Failed to post:', error.message);
        // res.send(`Failed to post: ${error.message}`);
    }
};

const getFacebookPostInsights = async (postId) => {
    const facebookAccount = await FacebookAccount.findOne({
		where: { account_id: accountId },
	  });
    const url = `https://graph.facebook.com/v12.0/${postId}/insights?metric=post_engaged_users,post_impressions`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${facebookAccount.access_token}`,
      },
    });
    console.log(response.data)
    return response.data;
  }
module.exports = {
	postToFacebook,
    getFacebookPostInsights
}


