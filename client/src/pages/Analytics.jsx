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

const computeDailyChange = (rows) => {
  if (!rows || rows.length === 0) return [];

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

  // Groups & accounts
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  // Analytics data
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  /* ----------------------------------
     Derived data
  ----------------------------------- */

  const displayedTrends = useMemo(() => {
    return showDailyChange ? computeDailyChange(trends) : trends;
  }, [trends, showDailyChange]);

  /* ----------------------------------
     Initial load: groups + accounts
  ----------------------------------- */

  useEffect(() => {
    if (!workspaceId) return;

    const fetchInit = async () => {
      try {
        const [groupsRes, accountsRes] = await Promise.all([
          getGroupsByWorkspace(workspaceId),
          getAccountsByWorkspace(workspaceId),
        ]);

        setGroups(groupsRes.data.groups || []);

        // ❌ FILTER OUT LINKEDIN
        const validAccounts =
          (accountsRes.data.accounts || []).filter(
            a => a.platform?.toLowerCase() !== 'linkedin'
          );

        setAccounts(validAccounts);
        setFilteredAccounts(validAccounts);
      } catch (err) {
        console.error(err);
        message.error('Failed to load accounts or groups');
      }
    };

    fetchInit();
  }, [workspaceId]);

  /* ----------------------------------
     Fetch analytics (BACKEND)
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
    } catch (err) {
      console.error(err);
      message.error('Failed to load analytics');
    }
  };

  /* ----------------------------------
     Trigger backend fetch
  ----------------------------------- */

  useEffect(() => {
    if (!workspaceId) return;
    fetchAll();
  }, [workspaceId, range, accountId, currentGroup]);

  /* ----------------------------------
     Group selection
  ----------------------------------- */

  const handleGroupChange = async (groupId) => {
    setAccountId('all');

    if (!groupId || groupId === 'all') {
      setCurrentGroup(null);
      setFilteredAccounts(accounts);
      return;
    }

    try {
      const group = groups.find(g => g.group_id === groupId);
      setCurrentGroup(group);

      const { data } = await getAccountsByGroup(groupId);

      const groupAccounts =
        (data.accounts || []).filter(
          a => a.platform?.toLowerCase() !== 'linkedin'
        );

      setFilteredAccounts(groupAccounts);
    } catch (err) {
      console.error(err);
      message.error('Failed to load group accounts');
    }
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
          backgroundColor: '#fff',
          overflowY: 'auto',
          height: 'calc(100vh - 64px - 48px)',
        }}
      >
        <h2>Analytics</h2>
        <p>Overview of post performance across accounts.</p>

        {/* Filters */}
        <Space style={{ marginBottom: 24 }} wrap>
          {/* Group */}
          <Select
            style={{ width: 200 }}
            value={currentGroup ? currentGroup.group_id : 'all'}
            onChange={handleGroupChange}
          >
            <Option value="all">All Groups</Option>
            {groups.map(g => (
              <Option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </Option>
            ))}
          </Select>

          {/* Range */}
          <Select
            value={range}
            onChange={setRange}
            style={{ width: 160 }}
          >
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>

          {/* Account */}
          <Select
            value={accountId}
            onChange={setAccountId}
            style={{ width: 220 }}
          >
            <Option value="all">All accounts</Option>
            {filteredAccounts.map(a => (
              <Option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </Option>
            ))}
          </Select>

          {/* Toggle */}
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
