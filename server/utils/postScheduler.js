// utils/postScheduler.js
const nodeSchedule = require('node-schedule');

const scheduledJobs = new Map();

/**
 * Schedule (or reschedule) a job for a post
 */
const schedulePostJob = (postId, scheduledAt, jobFn) => {
  // cancel old job if exists
  if (scheduledJobs.has(postId)) {
    scheduledJobs.get(postId).cancel();
    scheduledJobs.delete(postId);
  }

  const job = nodeSchedule.scheduleJob(new Date(scheduledAt), jobFn);
  scheduledJobs.set(postId, job);

  return job;
};

/**
 * Cancel a scheduled post job
 */
const cancelPostJob = (postId) => {
  if (scheduledJobs.has(postId)) {
    scheduledJobs.get(postId).cancel();
    scheduledJobs.delete(postId);
    return true;
  }
  return false;
};

module.exports = {
  schedulePostJob,
  cancelPostJob,
};
