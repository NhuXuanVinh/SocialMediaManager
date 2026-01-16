const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const withRetry = async ({
  fn,
  retries = 3,
  delayMs = 5 * 60 * 1000, // 5 minutes
  onRetry,
}) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;
      return await fn();
    } catch (err) {
      if (attempt >= retries) {
        throw err;
      }

      if (onRetry) {
        onRetry(err, attempt);
      }

      await sleep(delayMs);
    }
  }
};

module.exports = { withRetry };
