import axiosClient from './axiosClient';

/* ----------------------------------
   Analytics Overview (KPIs)
   impressions, likes, comments, shares
----------------------------------- */
export const getAnalyticsOverview = (params) => {
  return axiosClient.get('/analytics/overview', {
    params,
  });
};

/* ----------------------------------
   Engagement Trend (time series)
   date → impressions / likes / etc
----------------------------------- */
export const getAnalyticsTrends = (params) => {
  return axiosClient.get('/analytics/trends', {
    params,
  });
};

/* ----------------------------------
   Account Comparison
   metrics grouped by account
----------------------------------- */
export const getAnalyticsAccounts = (params) => {

  return axiosClient.get('/analytics/accounts', {
    params,
  });
};

/* ----------------------------------
   Top Performing Posts
----------------------------------- */
export const getTopPostsAnalytics = (params) => {
  return axiosClient.get('/analytics/top-posts', {
    params,
  });
};

// apis/analyticsAPI.js
export const getTopTagsAnalytics = (params) =>{
  return axiosClient.get('/analytics/top-tags', { params });
}
  

