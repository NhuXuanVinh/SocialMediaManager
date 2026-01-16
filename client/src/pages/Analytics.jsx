// pages/Analytics.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Select, Space, message, Switch } from 'antd';

import Topbar from '../components/Topbar';
import AnalyticsKPI from '../components/analytics/AnalyticsKPI';
import AnalyticsTrendChart from '../components/analytics/AnalyticsTrendChart';
import EngagementTrendChart from '../components/analytics/EngagementTrendChart';
import AccountComparison from '../components/analytics/AccountComparison';
import TopPostsTable from '../components/analytics/TopPostsTable';

import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsAccounts,
  getTopPostsAnalytics,
} from '../apis/analyticsAPI';

const { Content } = Layout;
const { Option } = Select;

/* ----------------------------------
   Helpers
----------------------------------- */

const computeDailyChange = (rows) => {
  if (!rows || rows.length === 0) return [];

  // Ensure correct order
  const sorted = [...rows].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return sorted.map((curr, index) => {
    if (index === 0) {
      return {
        ...curr,
        impressions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };
    }

    const prev = sorted[index - 1];

    return {
      date: curr.date,
      impressions: curr.impressions - prev.impressions,
      likes: curr.likes - prev.likes,
      comments: curr.comments - prev.comments,
      shares: curr.shares - prev.shares,
    };
  });
};

/* ----------------------------------
   Page
----------------------------------- */

const Analytics = () => {
  const workspaceId = localStorage.getItem('workspaceId');

  // Filters
  const [range, setRange] = useState('7d');
  const [accountId, setAccountId] = useState('all');
  const [showDailyChange, setShowDailyChange] = useState(false);

  // Data
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);           // RAW cumulative data
  const [accounts, setAccounts] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  /* ----------------------------------
     Derived data (NO refetch)
  ----------------------------------- */

  const displayedTrends = useMemo(() => {
    return showDailyChange ? computeDailyChange(trends) : trends;
  }, [trends, showDailyChange]);

  /* ----------------------------------
     Fetch
  ----------------------------------- */

  const fetchAll = async () => {
    try {
      const params = {
        workspaceId,
        range,
        accountId: accountId === 'all' ? undefined : accountId,
      };

      const [
        overviewRes,
        trendsRes,
        accountsRes,
        topPostsRes,
      ] = await Promise.all([
        getAnalyticsOverview(params),
        getAnalyticsTrends(params),
        getAnalyticsAccounts(params),
        getTopPostsAnalytics(params),
      ]);

      // Normalize trends to numbers (IMPORTANT)
      const normalizedTrends = trendsRes.data.map(d => ({
        date: d.date,
        impressions: Number(d.impressions),
        likes: Number(d.likes),
        comments: Number(d.comments),
        shares: Number(d.shares),
      }));

      setOverview(overviewRes.data);
      setTrends(normalizedTrends);      // ✅ ALWAYS raw data
      setAccountStats(accountsRes.data);
      setAccounts(accountsRes.data);
      setTopPosts(topPostsRes.data);

    } catch (err) {
      console.error(err);
      message.error('Failed to load analytics');
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAll();
  }, [workspaceId, range, accountId]);

  /* ----------------------------------
     Render
  ----------------------------------- */

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Topbar />

      <Content
        style={{
          margin: 24,
          padding: 24,
          backgroundColor: '#fff',
          overflowY: 'auto',
          height: 'calc(100vh - 64px - 48px)',
        }}
      >
        <h2>Analytics</h2>
        <p>Overview of post performance across accounts.</p>

        {/* Filters */}
        <Space style={{ marginBottom: 24 }}>
          <Select
            value={range}
            onChange={setRange}
            style={{ width: 160 }}
          >
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>

          <Select
            value={accountId}
            onChange={setAccountId}
            style={{ width: 200 }}
          >
            <Option value="all">All accounts</Option>
            {accounts.map(a => (
              <Option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </Option>
            ))}
          </Select>

          <Space>
            <Switch
              checked={showDailyChange}
              onChange={setShowDailyChange}
            />
            <span>
              {showDailyChange ? 'Daily change' : 'Cumulative'}
            </span>
          </Space>
        </Space>

        {/* Sections */}
        <AnalyticsKPI data={overview} />

        <AnalyticsTrendChart data={displayedTrends} />

        <EngagementTrendChart data={displayedTrends} />

        <AccountComparison data={accountStats} />

        <TopPostsTable data={topPosts} />
      </Content>
    </Layout>
  );
};

export default Analytics;
