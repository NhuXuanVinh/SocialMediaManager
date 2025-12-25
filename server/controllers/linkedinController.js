const { Account, LinkedinAccount, Post } = require('../models');
const { createPost } = require('../services/postService');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs').promises;
dotenv.config();

const LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_POST_URL = 'https://api.linkedin.com/v2/ugcPosts';
const LINKEDIN_MEDIA_UPLOAD_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';

const startLinkedInAuth = (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URI;

    if (!clientId || !redirectUri) {
        console.log('LinkedIn OAuth not configured properly.');
        return res.status(500).json({ error: 'LinkedIn OAuth not configured' });
    }

    const scope = 'openid profile w_member_social email';
    const statePayload = Buffer.from(JSON.stringify({ userId, t: Date.now() })).toString('base64');

    const authUrl = `${LINKEDIN_OAUTH_URL}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scope)}`;

    return res.json({ redirectUrl: authUrl });
};

const linkedinCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  let userId;
  try {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8')
    );
    userId = Number(decoded.userId); // ✅ normalize type
  } catch (e) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  try {
    // 1️⃣ Exchange code for access token
    const tokenRes = await axios.post(
      LINKEDIN_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Get LinkedIn user info
    const userInfoRes = await axios.get(LINKEDIN_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const linkedinUserId = userInfoRes.data.sub;
    const accountName = userInfoRes.data.name || 'LinkedIn User';
    const profileUrl = `https://www.linkedin.com/in/${linkedinUserId}`;

    // 3️⃣ Check if this LinkedIn account already exists
    let linkedinAccount = await LinkedinAccount.findOne({
      where: { linkedin_user_id: linkedinUserId },
      include: [{ model: Account }],
    });

    let account;

    if (linkedinAccount) {
      // 4️⃣ Update existing account
      account = linkedinAccount.Account;

      // Safety check: prevent cross-user linking
      if (account.user_id !== userId) {
        return res.status(403).json({
          error: 'This LinkedIn account is already linked to another user',
        });
      }

      await account.update({
        account_name: accountName,
        account_url: profileUrl,
      });

      await linkedinAccount.update({
        access_token: accessToken,
        profile_url: profileUrl,
      });
    } else {
      // 5️⃣ Create new Account
      account = await Account.create({
        user_id: userId,
        platform: 'Linkedin',
        account_name: accountName,
        account_url: profileUrl,
      });

      // 6️⃣ Create LinkedinAccount (1–1)
      linkedinAccount = await LinkedinAccount.create({
        account_id: account.account_id,
        linkedin_user_id: linkedinUserId,
        access_token: accessToken,
        profile_url: profileUrl,
      });
    }

    // 7️⃣ Redirect to dashboard
    const clientAppUrl = process.env.CLIENT_APP_URL||'http://localhost:3000';
    if (clientAppUrl) {
      return res.redirect(`${clientAppUrl}/dashboard?connected=linkedin`);
    }

    return res.json({
      message: 'LinkedIn account successfully linked!',
      account,
    });
  } catch (err) {
    console.error(
      'LinkedIn OAuth error:',
      err.response?.data || err.message
    );
    return res.status(500).json({ error: 'LinkedIn OAuth failed' });
  }
};


const postToLinkedIn = async ({ accountId, text, files }) => {
  try {
    const file = files?.[0] || null;

    const linkedinAccount = await LinkedinAccount.findOne({
      where: { account_id: accountId },
    });

  if (!linkedinAccount) {
    throw new Error('LinkedIn account not found');
  }

    const accessToken = linkedinAccount.access_token;
    const linkedinUrn = `urn:li:person:${linkedinAccount.linkedin_user_id}`;

    let mediaUrn = null;

    // 1️⃣ Upload media (optional)
    if (file) {
      const uploadResponse = await axios.post(
        LINKEDIN_MEDIA_UPLOAD_URL,
        {
          registerUploadRequest: {
            owner: linkedinUrn,
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            serviceRelationships: [
              {
                identifier: 'urn:li:userGeneratedContent',
                relationshipType: 'OWNER',
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const uploadUrl =
        uploadResponse.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;

      mediaUrn = uploadResponse.data.value.asset;

      const fileBuffer = await fs.readFile(file.path);
      await axios.put(uploadUrl, fileBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': file.mimetype,
        },
      });
    }

    // 2️⃣ Create LinkedIn post
    const postBody = {
      author: linkedinUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
          media: mediaUrn
            ? [
                {
                  status: 'READY',
                  media: mediaUrn,
                  title: { text: 'Image' },
                },
              ]
            : [],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const postResponse = await axios.post(LINKEDIN_POST_URL, postBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const platformPostId = postResponse.data.id;
    const postLink = `https://www.linkedin.com/feed/update/${platformPostId}`;

    // 3️⃣ Save post + tags (SERVICE)
    return{
      platformPostId,
      postLink,
    }
    console.log("Posted to LinkedIn successfully");
  } catch (error) {
    console.error(
      'Error posting to LinkedIn:',
      error.response?.data || error.message
    );
  }
};


module.exports = {
    postToLinkedIn,
    startLinkedInAuth,
    linkedinCallback,
};
