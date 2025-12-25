const OAuth = require('oauth').OAuth;
const fs = require('fs');
const { createPost } = require('../services/postService');
const { Account, TwitterAccount, Post } = require('../models');
const dotenv = require('dotenv');
const { TwitterApi } = require('twitter-api-v2');
dotenv.config();
// Twitter API credentials
const consumerKey = process.env.TWITTER_CONSUMER_KEY;
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const callbackUrl = process.env.TWITTER_CALLBACK_URL;

// Create OAuth instance
const oa = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumerKey,
  consumerSecret,
  '1.0A',
  callbackUrl,
  'HMAC-SHA1'
);

// Start OAuth flow
exports.startOAuthFlow = (req, res) => {
	const userId  = req.body.userId;
	req.session.userId = userId
   	if (!userId) {
     	return res.status(400).json({ error: 'User ID is required' });
   	}
	oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
	  if (error) {
		console.error('Error getting OAuth request token');
		return res.status(500).json({ error: 'Error getting OAuth request token' });
	  } else {
		req.session.oauthTokenSecret = oauthTokenSecret;
		req.session.userId = userId;
		// Redirect user to Twitter's authorization page
		const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
		res.json({ redirectUrl: authUrl });

	  }
	});
  }

// Handle OAuth callback
exports.handleOAuthCallback = async (req, res) => {
  const oauthToken = req.query.oauth_token;
  const oauthVerifier = req.query.oauth_verifier;
  const oauthTokenSecret = req.session.oauthTokenSecret;
  const userId = Number(req.session.userId); // ✅ normalize type

  try {
    // 1️⃣ Exchange request token for access token
    const getAccessToken = () =>
      new Promise((resolve, reject) => {
        oa.getOAuthAccessToken(
          oauthToken,
          oauthTokenSecret,
          oauthVerifier,
          (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
            if (error) return reject(error);
            resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
          }
        );
      });

    const { oauthAccessToken, oauthAccessTokenSecret, results } =
      await getAccessToken();

    // 2️⃣ Extract Twitter data
    const twitterUserId = results.user_id;
    const twitterScreenName = results.screen_name;
    const profileUrl = `https://twitter.com/${twitterScreenName}`;

    // 3️⃣ Check if this Twitter account already exists
    let twitterAccount = await TwitterAccount.findOne({
      where: { twitter_user_id: twitterUserId },
      include: [{ model: Account }],
    });

    let account;

    if (twitterAccount) {
      // 4️⃣ Update existing account
      account = twitterAccount.Account;

      // Safety check
      if (account.user_id !== userId) {
        return res.status(403).json({
          error: 'This Twitter account is already linked to another user',
        });
      }

      // Update account info
      await account.update({
        account_name: twitterScreenName,
        account_url: profileUrl,
      });

      // Update tokens
      await twitterAccount.update({
        access_token: oauthAccessToken,
        access_token_secret: oauthAccessTokenSecret,
        profile_url: profileUrl,
      });
    } else {
      // 5️⃣ Create new Account
      account = await Account.create({
        user_id: userId,
        platform: 'Twitter',
        account_name: twitterScreenName,
        account_url: profileUrl,
      });

      // 6️⃣ Create TwitterAccount (1–1)
      twitterAccount = await TwitterAccount.create({
        account_id: account.account_id,
        twitter_user_id: twitterUserId,
        access_token: oauthAccessToken,
        access_token_secret: oauthAccessTokenSecret,
        profile_url: profileUrl,
      });
    }

    // 7️⃣ Redirect to dashboard
    const clientAppUrl = process.env.CLIENT_APP_URL||'http://localhost:3000';
    if (clientAppUrl) {
      return res.redirect(`${clientAppUrl}/dashboard?connected=twitter`);
    }

    return res.json({
      message: 'Twitter account successfully linked!',
      account,
    });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return res.status(500).json({ error: 'Error during OAuth callback' });
  }
};

  const createTwitterClient = (token, tokenSecret) => {
	return new TwitterApi({
	  appKey: consumerKey,
	  appSecret: consumerSecret,
	  accessToken: token,
	  accessSecret: tokenSecret,
	});
  };

exports.postTweet = async ({ accountId, text, files }) => {
  try {

    const twitterAccount = await TwitterAccount.findOne({
      where: { account_id: accountId },
    });

  if (!twitterAccount) {
    throw new Error('Twitter account not linked');
  }

    const client = createTwitterClient(
      twitterAccount.access_token,
      twitterAccount.access_token_secret
    );

    // 1️⃣ Upload media (optional)
    const mediaIds = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const mediaData = fs.readFileSync(file.path);
        const mediaId = await client.v1.uploadMedia(mediaData, {
          mimeType: file.mimetype,
        });
        mediaIds.push(mediaId);
      }
    }

    // 2️⃣ Create tweet
    const tweetPayload =
      mediaIds.length > 0
        ? { text, media: { media_ids: mediaIds } }
        : { text };

    const { data: tweet } = await client.v2.tweet(tweetPayload);

    const postLink = `https://twitter.com/${twitterAccount.twitter_user_id}/status/${tweet.id}`;

    // 3️⃣ Save post + tags (SERVICE)
    return{
      platformPostId: tweet.id,
      postLink,
    }
    console.log("Posted to Twitter successfully");
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
};