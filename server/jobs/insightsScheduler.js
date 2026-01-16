const cron = require('node-cron');
const { withRetry } = require('../utils/retry');
const facebookService = require('../services/facebookService');
const twitterService = require('../services/twitterService');
const instagramService = require('../services/instagramService');
const startInsightsScheduler = () => {
	console.log('Insights scheduler started.');
cron.schedule(
  '50 5 * * *',
  async () => {
    console.log('[Scheduler] Daily insights job started');

    try {
      await withRetry({
        fn: facebookService.fetchFacebookInsights,
        retries: 3,
        delayMs: 10 * 60 * 1000, // retry every 10 minutes
        onRetry: (err, attempt) => {
          console.warn(
            `[Scheduler] Facebook retry ${attempt} failed:`,
            err.message
          );
        },
      });

      await withRetry({
        fn: twitterService.fetchTwitterInsights,
        retries: 3,
        delayMs: 15 * 60 * 1000, // longer for Twitter
        onRetry: (err, attempt) => {
          console.warn(
            `[Scheduler] Twitter retry ${attempt} failed:`,
            err.message
          );
        },
      });

      await withRetry({
        fn: instagramService.fetchInstagramInsights,
        retries: 3,
        delayMs: 15 * 60 * 1000, // longer for Instagram
        onRetry: (err, attempt) => {
          console.warn(
            `[Scheduler] Instagram retry ${attempt} failed:`,
            err.message
          );
        },
      });

      console.log('[Scheduler] Daily insights job finished');
    } catch (err) {
      console.error('[Scheduler] Daily insights job failed permanently:', err.message);
    }
  },
  {
    timezone: 'Asia/Ho_Chi_Minh',
  }
);

}
module.exports = startInsightsScheduler ;
