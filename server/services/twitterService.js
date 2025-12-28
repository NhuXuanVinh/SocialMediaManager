const OAuth = require('oauth').OAuth;
const fs = require('fs');
const axios = require('axios');
const { Account, TwitterAccount, Post, PostInsight }= require('../models');

const { waitForRateLimitReset } = require('../utils/rateLimit');
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
const startOAuthFlow = (req, res) => {
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
const handleOAuthCallback = async (req, res) => {
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

const postTweet = async ({ accountId, text, mediaUrls = [] }) => {
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

    const mediaIds = [];

    for (const url of mediaUrls) {
      const imageRes = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // ✅ Convert to Buffer
      const buffer = Buffer.from(imageRes.data);

      const mediaId = await client.v1.uploadMedia(buffer, {
        mimeType: imageRes.headers['content-type'],
      });

      // ✅ Force string
      mediaIds.push(mediaId.toString());
    }

    const payload =
      mediaIds.length > 0
        ? {
            text,
            media: { media_ids: mediaIds },
          }
        : { text };

    const { data: tweet } = await client.v2.tweet(payload);

    return {
      platformPostId: tweet.id,
      postLink: `https://twitter.com/${twitterAccount.twitter_user_id}/status/${tweet.id}`,
    };
  } catch (error) {
    console.error('Twitter post error:', error);
    throw error;
  }
};

const fetchTwitterInsights = async () => {
  const twitterAccounts = await TwitterAccount.findAll();
  if (!twitterAccounts.length) return;

  for (const twitterAccount of twitterAccounts) {
    try {
      if (!twitterAccount.account_id) {
        console.warn('[Twitter] Skipping account with missing account_id');
        continue;
      }

      const posts = await Post.findAll({
        where: {
          account_id: twitterAccount.account_id,
          status: 'posted',
        },
        attributes: ['post_id', 'post_platform_id'],
      });

      if (!posts.length) continue;

      const CHUNK_SIZE = 100; // Twitter hard limit

      for (let i = 0; i < posts.length; i += CHUNK_SIZE) {
        const chunk = posts.slice(i, i + CHUNK_SIZE);
        const tweetIds = chunk
          .map(p => p.post_platform_id)
          .filter(Boolean)
          .join(',');

        if (!tweetIds) continue;

        let success = false;

        while (!success) {
          try {
            const response = await axios.get(
              'https://api.twitter.com/2/tweets',
              {
                headers: {
                  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
                },
                params: {
                  ids: tweetIds,
                  'tweet.fields': 'public_metrics',
                },
              }
            );

            const tweets = response.data?.data || [];

            for (const tweet of tweets) {
              const post = chunk.find(
                p => p.post_platform_id === tweet.id
              );
              if (!post) continue;

              await PostInsight.upsert({
                post_id: post.post_id,
                platform: 'twitter',
                post_platform_id: tweet.id,
                impressions: tweet.public_metrics.impression_count ?? 0,
                likes: tweet.public_metrics.like_count ?? 0,
                comments: tweet.public_metrics.reply_count ?? 0,
                shares:
                  (tweet.public_metrics.retweet_count ?? 0) +
                  (tweet.public_metrics.quote_count ?? 0),
                captured_at: new Date().setHours(0, 0, 0, 0),
              });
            }

            success = true;
          } catch (error) {
            if (error.response?.status === 429) {
              await waitForRateLimitReset(error.response.headers);
            } else {
              console.error('[Twitter] Batch failed', {
                accountId: twitterAccount.account_id,
                error: error.response?.data || error.message,
              });
              break; // ❌ do not retry non-rate-limit errors
            }
          }
        }
      }
    } catch (accountError) {
      console.error('[Twitter] Account failed', {
        accountId: twitterAccount.account_id,
        error: accountError.message,
      });
    }
  }
};




module.exports = {
  handleOAuthCallback,
  startOAuthFlow,
  postTweet,
  fetchTwitterInsights,
}
