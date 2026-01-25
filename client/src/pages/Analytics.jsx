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

const Analytics = () => {
  const workspaceId = localStorage.getItem('workspaceId');

  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentGroup, setCurrentGroup] = useState('all');

  const [range, setRange] = useState('7d');
  const [accountId, setAccountId] = useState('all');
  const [showDailyChange, setShowDailyChange] = useState(false);

  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  /* ----------------------------------
     Load groups + accounts
  ----------------------------------- */
  useEffect(() => {
    if (!workspaceId) return;

    getGroupsByWorkspace(workspaceId)
      .then(res => setGroups(res.data.groups || []))
      .catch(console.error);

    getAccountsByWorkspace(workspaceId)
      .then(res => {
        const nonLinkedIn = (res.data.accounts || []).filter(
          a => a.platform.toLowerCase() !== 'linkedin'
        );
        setAccounts(nonLinkedIn);
      })
      .catch(console.error);
  }, [workspaceId]);

  /* ----------------------------------
     Resolve accountIds from group
  ----------------------------------- */
  const resolvedAccountIds = useMemo(() => {
    if (accountId !== 'all') return undefined;

    if (currentGroup === 'all') {
      return accounts.map(a => a.account_id);
    }

    const group = groups.find(g => g.group_id === currentGroup);
    if (!group?.Accounts) return [];

    return group.Accounts
      .filter(a => a.platform.toLowerCase() !== 'linkedin')
      .map(a => a.account_id);
  }, [currentGroup, accounts, groups, accountId]);

  /* ----------------------------------
     Fetch analytics
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
      setTrends(trendsRes.data);
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
     Render
  ----------------------------------- */
  return (
    <Layout>
      <Topbar />

      <Content style={{ margin: 24, padding: 24, background: '#fff' }}>
        <h2>Analytics</h2>

        <Space style={{ marginBottom: 24 }}>
          <Select value={range} onChange={setRange} style={{ width: 160 }}>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>

          <Select
            value={currentGroup}
            onChange={setCurrentGroup}
            style={{ width: 200 }}
          >
            <Option value="all">All Groups</Option>
            {groups.map(g => (
              <Option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </Option>
            ))}
          </Select>

          <Select
            value={accountId}
            onChange={setAccountId}
            style={{ width: 220 }}
          >
            <Option value="all">All Accounts</Option>
            {accounts.map(a => (
              <Option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </Option>
            ))}
          </Select>

          <Space>
            <Switch checked={showDailyChange} onChange={setShowDailyChange} />
            <span>{showDailyChange ? 'Daily change' : 'Cumulative'}</span>
          </Space>
        </Space>

        <AnalyticsKPI data={overview} />
        <AnalyticsTrendChart data={trends} />
        <EngagementTrendChart data={trends} />
        <AccountComparison data={accountStats} />
        <TopPostsTable data={topPosts} />
      </Content>
    </Layout>
  );
};

export default Analytics;
