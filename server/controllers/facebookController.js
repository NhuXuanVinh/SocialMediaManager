
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { Post } = require('../models');
const { FacebookAccount } = require('../models');
const { Account } = require('../models');
require('dotenv').config();

const startFacebookAuth = (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}
	const clientId = process.env.FACEBOOK_APP_ID;
	const redirectUri = process.env.FACEBOOK_CALLBACK_URL;
	if (!clientId || !redirectUri) {
		return res.status(500).json({ error: 'Facebook OAuth not configured' });
	}
	const scope = [
		'pages_manage_posts',
		'pages_read_engagement',
		'pages_show_list',
		'pages_read_user_content',
	].join(',');
	const statePayload = Buffer.from(JSON.stringify({ userId, t: Date.now() })).toString('base64');
	const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scope)}`;
	return res.json({ redirectUrl: authUrl });
};

const facebookCallback = async (req, res) => {
	const { code, state } = req.query;
	if (!code || !state) {
		return res.status(400).json({ error: 'Missing code or state' });
	}
	let userId = null;
	try {
		const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
		userId = decoded.userId;
	} catch (e) {
		return res.status(400).json({ error: 'Invalid state' });
	}
	try {
		const tokenResponse = await axios.get('https://graph.facebook.com/v12.0/oauth/access_token', {
			params: {
				client_id: process.env.FACEBOOK_APP_ID,
				client_secret: process.env.FACEBOOK_APP_SECRET,
				redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
				code,
			},
		});
		const userAccessToken = tokenResponse.data.access_token;

		const accountsResponse = await axios.get('https://graph.facebook.com/v12.0/me/accounts', {
			headers: { Authorization: `Bearer ${userAccessToken}` },
		});
		const pages = accountsResponse.data.data || [];
		if (pages.length === 0) {
			return res.status(400).json({ error: 'No Facebook Pages found for this user' });
		}

		const page = pages[0];
		const pageId = page.id;
		const pageName = page.name;
		const pageAccessToken = page.access_token;
		const profileUrl = `https://www.facebook.com/${pageId}`;

		const account = await Account.create({
			user_id: userId,
			platform: 'Facebook',
			account_name: pageName,
			account_url: profileUrl,
		});
		await FacebookAccount.create({
			account_id: account.account_id,
			facebook_user_id: pageId,
			access_token: pageAccessToken,
			profile_url: profileUrl,
		});

		const clientAppUrl = process.env.CLIENT_APP_URL;
		if (clientAppUrl) {
			return res.redirect(`${clientAppUrl}/dashboard?connected=facebook`);
		}
		return res.json({ message: 'Facebook Page successfully linked!', account });
	} catch (err) {
		console.error('Facebook OAuth error:', err.response?.data || err.message);
		return res.status(500).json({ error: 'Facebook OAuth failed' });
	}
};

// Route to handle posting to Facebook page
const postToFacebook =  async (req, res) => {
	const accountId = req.body.accountId
	const text = req.body.text
	const files = req.body.files
	const facebookAccount = await FacebookAccount.findOne({
		where: { account_id: accountId },
	  });
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
        const newPost = await Post.create({
            post_platform_id: postPlatformId,
            post_link: postLink,
            content: text,
            scheduledAt: null, // Assuming it's an instant post
            status: 'posted', // Set appropriate status
            account_id: accountId, // Ensure this is provided in the request
        });
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
    getFacebookPostInsights,
	startFacebookAuth,
	facebookCallback,
}


