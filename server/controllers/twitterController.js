const OAuth = require('oauth').OAuth;
const fs = require('fs');
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
	const userId = req.session.userId;
	try {
	  // Convert `oa.getOAuthAccessToken` to a Promise-based function
	  const getAccessToken = () => {
		return new Promise((resolve, reject) => {
		  oa.getOAuthAccessToken(
			oauthToken,
			oauthTokenSecret,
			oauthVerifier,
			(error, oauthAccessToken, oauthAccessTokenSecret, results) => {
			  if (error) {
				return reject(error);
			  }
			  resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
			}
		  );
		});
	  };
  
	  // Await the result of the access token exchange
	  const { oauthAccessToken, oauthAccessTokenSecret, results } = await getAccessToken();
  
	  // Extract user data from Twitter response
	  const twitterUserId = results.user_id;
	  const twitterScreenName = results.screen_name;
	  const profileUrl = `https://twitter.com/${twitterScreenName}`;
  
	  // Save the data to the Account and TwitterAccount models
	  const account = await Account.create({
		user_id: userId, // Use the provided userId
		platform: 'Twitter',
		account_name: twitterScreenName,
		account_url: profileUrl,
	  });
  
	  await TwitterAccount.create({
		account_id: account.account_id,
		twitter_user_id: twitterUserId,
		access_token: oauthAccessToken,
		access_token_secret: oauthAccessTokenSecret,
		profile_url: profileUrl,
	  });
  
	  const clientAppUrl = process.env.CLIENT_APP_URL;
	  if (clientAppUrl) {
		return res.redirect(`${clientAppUrl}/dashboard?connected=twitter`);
	  }
	  res.json({
		message: 'Twitter account successfully linked!',
		account,
	  });
	} catch (error) {
	  console.error('Error during OAuth callback:', error);
	  res.status(500).json({ error: 'Error during OAuth callback' });
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

  exports. postTweet = async (req, res) => {
	console.log("posted")
	try {
	  // Retrieve the user's Twitter tokens from your database
	  const accountId = req.body.accountId;
	  const tweetText = req.body.text;
	const files = req.body.files
	  const twitterAccount = await TwitterAccount.findOne({
		where: { account_id: accountId },
	  });
	  if (!twitterAccount) {
		return res.status(400).json({ success: false, message: 'Twitter account not linked.' });
	  }
	  
	  // Create Twitter client using the user's tokens
	  const client = createTwitterClient(twitterAccount.access_token, twitterAccount.access_token_secret);
	  const mediaIds = [];
	  if (files && files.length > 0) {
		for (const file of files) {
			const mediaData = fs.readFileSync(file.path); // Read the file
			const mediaUploadResponse = await client.v1.uploadMedia(mediaData, { mimeType: file.mimetype }); // Specify type
			mediaIds.push(mediaUploadResponse); // Store media_id
		}
	}
	// console.log(mediaIds)
	  const tweetData = mediaIds.length > 0
	  ? { text: tweetText, media: { media_ids: mediaIds } } // Include media if present
	  : { text: tweetText };
	  // Post the tweet
	  const { data: tweet } = await client.v2.tweet(tweetData, {
		media: { media_ids: mediaIds },
	  });
	  const newPost = await Post.create({
		account_id: accountId,
		post_platform_id: tweet.id, // Use the tweet ID returned by Twitter
		post_link: `https://twitter.com/${twitterAccount.twitter_user_id}/status/${tweet.id}`,
		content: tweetText,
		scheduledAt: null, // Assuming it's an instant post
		status: 'posted',
	  });
	  console.log("Post to twitter successful")
	  res.json({
		success: true,
		message: 'Tweet posted successfully!',
		tweet,
	  });
	} catch (error) {
	  console.log('Error posting tweet:', error);
	  return error
	}
  };