const OAuth = require('oauth').OAuth;
const fs = require('fs');
const axios = require('axios');
const { Account, TwitterAccount, Post, PostInsight, TwitterOAuthRequest }= require('../models');

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
const startOAuthFlow = async (req, res) => {
  const { workspaceId } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  oa.getOAuthRequestToken(async (error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error('Error getting OAuth request token', error);
      return res.status(500).json({ error: 'OAuth init failed' });
    }

    try {
      // ✅ store token secret in DB (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await TwitterOAuthRequest.upsert({
        oauth_token: oauthToken,
        oauth_token_secret: oauthTokenSecret,
        workspace_id: Number(workspaceId),
        expires_at: expiresAt,
      });

      const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
      return res.json({ redirectUrl: authUrl });
    } catch (err) {
      console.error('[Twitter OAuth start] DB save failed:', err);
      return res.status(500).json({ error: 'OAuth DB save failed' });
    }
  });
};

/* ----------------------------------------
   Callback (DB-backed)
---------------------------------------- */
const handleOAuthCallback = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Missing OAuth parameters' });
  }

  // ✅ get stored secret + workspace from DB
  const record = await TwitterOAuthRequest.findOne({
    where: { oauth_token },
  });

  if (!record) {
    return res.status(400).json({ error: 'OAuth request expired or invalid' });
  }

  if (new Date(record.expires_at) < new Date()) {
    await record.destroy();
    return res.status(400).json({ error: 'OAuth request expired' });
  }

  const oauthTokenSecret = record.oauth_token_secret;
  const workspaceId = record.workspace_id;

  try {
    const getAccessToken = () =>
      new Promise((resolve, reject) => {
        oa.getOAuthAccessToken(
          oauth_token,
          oauthTokenSecret,
          oauth_verifier,
          (err, accessToken, accessTokenSecret, results) => {
            if (err) return reject(err);
            resolve({ accessToken, accessTokenSecret, results });
          }
        );
      });

    const { accessToken, accessTokenSecret, results } = await getAccessToken();

    const twitterUserId = results.user_id;
    const twitterScreenName = results.screen_name;
    const profileUrl = `https://twitter.com/${twitterScreenName}`;

    let twitterAccount = await TwitterAccount.findOne({
      where: { twitter_user_id: twitterUserId },
      include: [{ model: Account }],
    });

    let account;

    if (twitterAccount) {
      account = twitterAccount.Account;

      // workspace safety
      if (Number(account.workspace_id) !== Number(workspaceId)) {
        return res.status(403).json({
          error: 'Twitter account already linked to another workspace',
        });
      }

      await account.update({
        account_name: twitterScreenName,
        account_url: profileUrl,
      });

      await twitterAccount.update({
        access_token: accessToken,
        access_token_secret: accessTokenSecret,
        profile_url: profileUrl,
      });
    } else {
      account = await Account.create({
        workspace_id: workspaceId,
        platform: 'Twitter',
        account_name: twitterScreenName,
        account_url: profileUrl,
      });

      await TwitterAccount.create({
        account_id: account.account_id,
        twitter_user_id: twitterUserId,
        access_token: accessToken,
        access_token_secret: accessTokenSecret,
        profile_url: profileUrl,
      });
    }

    // ✅ cleanup record after success
    await record.destroy();

    const clientAppUrl = process.env.CLIENT_APP_URL;
    return res.redirect(`${clientAppUrl}/dashboard?connected=twitter`);
  } catch (err) {
    console.error('Twitter OAuth callback error:', err);
    return res.status(500).json({ error: 'Twitter OAuth failed' });
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
      const MAX_RETRIES = 3;

      for (let i = 0; i < posts.length; i += CHUNK_SIZE) {
        const chunk = posts.slice(i, i + CHUNK_SIZE);
        const tweetIds = chunk
          .map(p => p.post_platform_id)
          .filter(Boolean)
          .join(',');

        if (!tweetIds) continue;

        let success = false;
         let attempt = 0;

        while (!success && attempt < MAX_RETRIES) {
          attempt++;
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
              if (attempt >= MAX_RETRIES) {
    console.warn('[Twitter] Rate limit exceeded, skipping account', {
      accountId: twitterAccount.account_id,
    });
    break; // ❗thoát vòng retry
  }
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

const fetchTwitterInsightsTest = async () => {
  const twitterAccounts = await TwitterAccount.findAll();
  if (!twitterAccounts.length) return;

  for (const twitterAccount of twitterAccounts) {
    try {
      if (!twitterAccount.account_id) {
        console.warn("[Twitter - TEST] Skipping account with missing account_id");
        continue;
      }

      const posts = await Post.findAll({
        where: {
          account_id: twitterAccount.account_id,
          status: "posted",
        },
        attributes: ["post_id", "post_platform_id"],
      });

      if (!posts.length) continue;

      const CHUNK_SIZE = 100; // Twitter hard limit

      for (let i = 0; i < posts.length; i += CHUNK_SIZE) {
        const chunk = posts.slice(i, i + CHUNK_SIZE);
        const tweetIds = chunk
          .map((p) => p.post_platform_id)
          .filter(Boolean)
          .join(",");

        if (!tweetIds) continue;

        let success = false;

        while (!success) {
          try {
            const response = await axios.get("https://api.twitter.com/2/tweets", {
              headers: {
                Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
              },
              params: {
                ids: tweetIds,
                "tweet.fields": "public_metrics",
              },
            });

            const tweets = response.data?.data || [];

            for (const tweet of tweets) {
              const post = chunk.find((p) => p.post_platform_id === tweet.id);
              if (!post) continue;

              const insightData = {
                post_id: post.post_id,
                platform: "twitter",
                post_platform_id: tweet.id,
                impressions: tweet.public_metrics?.impression_count ?? 0,
                likes: tweet.public_metrics?.like_count ?? 0,
                comments: tweet.public_metrics?.reply_count ?? 0,
                shares:
                  (tweet.public_metrics?.retweet_count ?? 0) +
                  (tweet.public_metrics?.quote_count ?? 0),
                captured_at: new Date().setHours(0, 0, 0, 0),

                // ✅ raw debug
                raw: tweet.public_metrics,
              };

              console.log("=================================");
              console.log("[Twitter Insights - TEST]");
              console.log("Twitter Account:", twitterAccount.account_id);
              console.log("Post:", post.post_id, "| Tweet ID:", tweet.id);
              console.log("Insight Data:", insightData);
              console.log("=================================\n");
            }

            success = true;
          } catch (error) {
            if (error.response?.status === 429) {
              console.warn("[Twitter - TEST] Rate limited, waiting reset...");
              await waitForRateLimitReset(error.response.headers);
            } else {
              console.error("[Twitter - TEST] Batch failed", {
                accountId: twitterAccount.account_id,
                error: error.response?.data || error.message,
              });
              break; // ❌ no retry for non-rate-limit errors
            }
          }
        }
      }
    } catch (accountError) {
      console.error("[Twitter - TEST] Account failed", {
        accountId: twitterAccount.account_id,
        error: accountError.response?.data || accountError.message,
      });
    }
  }
};




module.exports = {
  handleOAuthCallback,
  startOAuthFlow,
  postTweet,
  fetchTwitterInsights,
  fetchTwitterInsightsTest,
}
