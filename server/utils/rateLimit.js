const waitForRateLimitReset = async (headers) => {
  const resetUnix = Number(headers['x-rate-limit-reset']);
  if (!resetUnix) {
    console.warn('[Twitter] Rate limit hit but no reset header found');
    await new Promise(res => setTimeout(res, 60_000)); // fallback 1 min
    return;
  }

  const waitMs = resetUnix * 1000 - Date.now();
  if (waitMs > 0) {
    console.warn(`[Twitter] Rate limit hit. Waiting ${Math.ceil(waitMs / 1000)}s`);
    await new Promise(res => setTimeout(res, waitMs));
  }
};

module.exports = {
  waitForRateLimitReset,
};