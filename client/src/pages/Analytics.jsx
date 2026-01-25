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

import { getGroupsByWorkspace } from '../apis/groupAPI';
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
      return {
        ...curr,
        impressions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };
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

  /* Filters */
  const [range, setRange] = useState('7d');
  const [currentGroup, setCurrentGroup] = useState('all');
  const [accountId, setAccountId] = useState('all');
  const [showDailyChange, setShowDailyChange] = useState(false);

  /* Groups & Accounts */
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);

  /* Analytics data */
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  /* ----------------------------------
     Initial load: groups + accounts
  ----------------------------------- */
  useEffect(() => {
    if (!workspaceId) return;

    const init = async () => {
      try {
        const [groupsRes, accountsRes] = await Promise.all([
          getGroupsByWorkspace(workspaceId),
          getAccountsByWorkspace(workspaceId),
        ]);

        setGroups(groupsRes.data.groups || []);

        // ❌ Exclude LinkedIn
        const nonLinkedIn =
          (accountsRes.data.accounts || []).filter(
            a => a.platform?.toLowerCase() !== 'linkedin'
          );

        setAccounts(nonLinkedIn);
      } catch (err) {
        console.error(err);
        message.error('Failed to load groups or accounts');
      }
    };

    init();
  }, [workspaceId]);

  /* ----------------------------------
     Accounts visible in dropdown
  ----------------------------------- */
  const visibleAccounts = useMemo(() => {
    if (currentGroup === 'all') return accounts;

    const group = groups.find(g => g.group_id === currentGroup);
    if (!group?.Accounts) return [];

    return group.Accounts.filter(
      a => a.platform?.toLowerCase() !== 'linkedin'
    );
  }, [currentGroup, groups, accounts]);

  /* ----------------------------------
     Resolve accountIds for backend
  ----------------------------------- */
  const resolvedAccountIds = useMemo(() => {
    if (accountId !== 'all') return undefined;

    if (currentGroup === 'all') {
      return accounts.map(a => a.account_id);
    }

    return visibleAccounts.map(a => a.account_id);
  }, [accountId, currentGroup, accounts, visibleAccounts]);

  /* ----------------------------------
     Fetch analytics from backend
  ----------------------------------- */
  const fetchAnalytics = async () => {
    try {
      const params = {
        workspaceId,
        range,
        accountId: accountId !== 'all' ? accountId : undefined,
        accountIds: resolvedAccountIds,
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

      setOverview(overviewRes.data);
      setTrends(
        trendsRes.data.map(d => ({
          date: d.date,
          impressions: Number(d.impressions),
          likes: Number(d.likes),
          comments: Number(d.comments),
          shares: Number(d.shares),
        }))
      );
      setAccountStats(accountsRes.data);
      setTopPosts(topPostsRes.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load analytics');
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAnalytics();
  }, [workspaceId, range, accountId, currentGroup]);

  /* ----------------------------------
     Derived data
  ----------------------------------- */
  const displayedTrends = useMemo(
    () => (showDailyChange ? computeDailyChange(trends) : trends),
    [trends, showDailyChange]
  );

  /* ----------------------------------
     Handlers
  ----------------------------------- */
  const handleGroupChange = (groupId) => {
    setCurrentGroup(groupId);
    setAccountId('all'); // reset account when group changes
  };

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
          background: '#fff',
          overflowY: 'auto',
          height: 'calc(100vh - 64px - 48px)',
        }}
      >
        <h2>Analytics</h2>
        <p>Overview of post performance across accounts.</p>

        {/* Filters */}
        <Space style={{ marginBottom: 24 }} wrap>
          <Select
            value={currentGroup}
            onChange={handleGroupChange}
            style={{ width: 200 }}
          >
            <Option value="all">All Groups</Option>
            {groups.map(g => (
              <Option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </Option>
            ))}
          </Select>

          <Select value={range} onChange={setRange} style={{ width: 160 }}>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>

          <Select
            value={accountId}
            onChange={setAccountId}
            style={{ width: 220 }}
          >
            <Option value="all">All Accounts</Option>
            {visibleAccounts.map(a => (
              <Option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </Option>
            ))}
          </Select>

          <Space>
            <Switch checked={showDailyChange} onChange={setShowDailyChange} />
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
