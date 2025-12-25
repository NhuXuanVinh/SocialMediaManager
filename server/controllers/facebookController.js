
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { Post } = require('../models');
const { FacebookAccount } = require('../models');
const { Account } = require('../models');
const { createPost } = require('../services/postService');
require('dotenv').config();

const startFacebookAuth = (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' });
	}
	const clientId = process.env.FACEBOOK_APP_ID;
	const redirectUri = process.env.FACEBOOK_CALLBACK_URI;
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
		userId = Number(decoded.userId);
	} catch (e) {
		return res.status(400).json({ error: 'Invalid state' });
	}
	try {
		const tokenResponse = await axios.get('https://graph.facebook.com/v12.0/oauth/access_token', {
			params: {
				client_id: process.env.FACEBOOK_APP_ID,
				client_secret: process.env.FACEBOOK_APP_SECRET,
				redirect_uri: process.env.FACEBOOK_CALLBACK_URI,
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

// 1️⃣ Check if this Facebook Page is already linked
let facebookAccount = await FacebookAccount.findOne({
  where: { facebook_user_id: pageId },
  include: [{ model: Account }],
});

let account;

if (facebookAccount) {
  // 2️⃣ Update existing account
  account = facebookAccount.Account;
		console.log("user_id: ", account.user_id, "userId: ", userId);
	// Safety check: ensure same user
	if (account.user_id !== userId) {
		return res.status(403).json({
		error: 'This Facebook Page is already linked to another user',
		});
	}

  // Update account info
  await account.update({
    account_name: pageName,
    account_url: profileUrl,
  });

  // Update Facebook token
  await facebookAccount.update({
    access_token: pageAccessToken,
    profile_url: profileUrl,
  });

} else {
  // 3️⃣ Create new account
  account = await Account.create({
    user_id: userId,
    platform: 'Facebook',
    account_name: pageName,
    account_url: profileUrl,
  });

  facebookAccount = await FacebookAccount.create({
    account_id: account.account_id,
    facebook_user_id: pageId,
    access_token: pageAccessToken,
    profile_url: profileUrl,
  });
}


		const clientAppUrl = process.env.CLIENT_APP_URL||'http://localhost:3000';
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
const postToFacebook = async ({ accountId, text, files }) => {
  try {
    

    const facebookAccount = await FacebookAccount.findOne({
      where: { account_id: accountId },
    });


  if (!facebookAccount) {
    throw new Error('Facebook account not found');
  }

    const pageId = facebookAccount.facebook_user_id;
    const accessToken = facebookAccount.access_token;

    // -----------------------------
    // Upload images (unpublished)
    // -----------------------------
    const photoIds = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const formData = new FormData();
        const buffer = fs.readFileSync(file.path);

        formData.append('source', buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        formData.append('published', 'false');

        const photoRes = await axios.post(
          `https://graph.facebook.com/v12.0/${pageId}/photos`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        photoIds.push(photoRes.data.id);
      }
    }

    // -----------------------------
    // Create Facebook post
    // -----------------------------
    const postResponse = await axios.post(
      `https://graph.facebook.com/v12.0/${pageId}/feed`,
      {
        message: text,
        attached_media: photoIds.map((id) => ({ media_fbid: id })),
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const platformPostId = postResponse.data.id;
    const postLink = `https://www.facebook.com/${platformPostId}`;

    // -----------------------------
    // Save post + tags (SERVICE)
    // -----------------------------
    return{
      platformPostId,
      postLink,
    }
    console.log("Posted to Facebook successfully");
  } catch (error) {
    console.error('Facebook post error:', error.response?.data || error.message);
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


