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

import { getGroupsByWorkspace, getAccountsByGroup } from '../apis/groupAPI';
import { getAccountsByWorkspace } from '../apis/accountAPI';

const { Content } = Layout;
const { Option } = Select;

/* ----------------------------------
   Helpers
----------------------------------- */

const computeDailyChange = (rows = []) => {
  if (!rows.length) return [];

  const sorted = [...rows].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return sorted.map((curr, i) => {
    if (i === 0) {
      return { ...curr, impressions: 0, likes: 0, comments: 0, shares: 0 };
    }

    const prev = sorted[i - 1];
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

  // Group + account state (same as Dashboard)
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  // Filters
  const [range, setRange] = useState('7d');
  const [accountId, setAccountId] = useState('all');
  const [showDailyChange, setShowDailyChange] = useState(false);

  // Analytics data
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  /* ----------------------------------
     Derived
  ----------------------------------- */

  const displayedTrends = useMemo(
    () => (showDailyChange ? computeDailyChange(trends) : trends),
    [trends, showDailyChange]
  );

  /* ----------------------------------
     Fetch groups
  ----------------------------------- */

  useEffect(() => {
    if (!workspaceId) return;

    getGroupsByWorkspace(workspaceId)
      .then(res => setGroups(res.data.groups || []))
      .catch(() => message.error('Failed to load groups'));
  }, [workspaceId]);

  /* ----------------------------------
     Fetch accounts (workspace)
  ----------------------------------- */

  const fetchAccounts = async () => {
    if (!workspaceId) return;

    try {
      const { data } = await getAccountsByWorkspace(workspaceId);
      setAccounts(data.accounts || []);
      setFilteredAccounts(data.accounts || []);
    } catch {
      message.error('Failed to load accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [workspaceId]);

  /* ----------------------------------
     Group selection (same logic as Dashboard)
  ----------------------------------- */

  const handleGroupSelect = async (groupId) => {
    setAccountId('all');

    if (!groupId || groupId === 'all') {
      setCurrentGroup(null);
      setFilteredAccounts(accounts);
      return;
    }

    try {
      const group = groups.find(g => g.group_id === groupId);
      setCurrentGroup(group || null);

      const { data } = await getAccountsByGroup(groupId);
      setFilteredAccounts(data.accounts || []);
    } catch {
      message.error('Failed to load group accounts');
    }
  };

  /* ----------------------------------
     Fetch analytics
  ----------------------------------- */

  const fetchAnalytics = async () => {
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

      const normalizedTrends = trendsRes.data.map(d => ({
        date: d.date,
        impressions: Number(d.impressions),
        likes: Number(d.likes),
        comments: Number(d.comments),
        shares: Number(d.shares),
      }));

      setOverview(overviewRes.data);
      setTrends(normalizedTrends);
      setAccountStats(accountsRes.data);
      setTopPosts(topPostsRes.data);
    } catch {
      message.error('Failed to load analytics');
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAnalytics();
  }, [workspaceId, range, accountId, filteredAccounts]);

  /* ----------------------------------
     Render
  ----------------------------------- */

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Content
        style={{
          margin: 24,
          padding: 24,
          background: '#fff',
          overflowY: 'auto',
          height: 'calc(100vh - 64px - 48px)',
        }}
      >
        <h2>Analytics</h2>
        <p>
          {currentGroup ? currentGroup.group_name : 'All Accounts'}
        </p>

        {/* Filters */}
        <Space style={{ marginBottom: 24 }}>
          {/* Group */}
          <Select
            style={{ width: 180 }}
            value={currentGroup ? currentGroup.group_id : 'all'}
            onChange={(v) => handleGroupSelect(v)}
          >
            <Option value="all">All Groups</Option>
            {groups.map(g => (
              <Option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </Option>
            ))}
          </Select>

          {/* Account */}
          <Select
            style={{ width: 220 }}
            value={accountId}
            onChange={setAccountId}
          >
            <Option value="all">All accounts</Option>
            {filteredAccounts.map(a => (
              <Option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </Option>
            ))}
          </Select>

          {/* Range */}
          <Select value={range} onChange={setRange} style={{ width: 160 }}>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>

          {/* Mode */}
          <Space>
            <Switch checked={showDailyChange} onChange={setShowDailyChange} />
            <span>{showDailyChange ? 'Daily change' : 'Cumulative'}</span>
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
