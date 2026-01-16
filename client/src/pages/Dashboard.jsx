// Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Button, Segmented, Input, Select } from 'antd';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Calendar from '../components/Calendar/Calendar';
import NewPostModal from '../components/NewPostModal';
import PostsListView from '../components/PostsListView';
import { getGroupsByWorkspace, getAccountsByGroup } from '../apis/groupAPI';
import { getAccountsByWorkspace } from '../apis/accountAPI';
import { getMyWorkspaceRole } from '../apis/workspaceAPI';
import { getTags } from '../apis/tagAPI';

const { Content } = Layout;
const { Option } = Select;

const Dashboard = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState('calendar');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  /* ---------------------------
     Load tags
  ---------------------------- */
  useEffect(() => {
    getTags({ workspaceId, limit: 100 })
      .then(res => setAllTags(res.data.data || []))
      .catch(() => console.error('Failed to load tags'));
  }, []);

  /* ---------------------------
     Extract posts from accounts
  ---------------------------- */
  const extractPosts = (accounts) => {
    const result = [];

    accounts.forEach(account => {
      (account.Posts || []).forEach(post => {
        result.push({
          post_id: post.post_id,
          content: post.content,
          date: post.scheduledAt
            ? new Date(post.scheduledAt)
            : new Date(post.createdAt),
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
          accountName: account.account_name,
          platform: account.platform,
          postLink: post.post_link,
          status: post.status,
          tags: post.Tags || [],
          PostMedia: post.PostMedia || [],
        });
      });
    });

    return result;
  };

  /* ---------------------------
     Fetch groups by workspace
  ---------------------------- */
  useEffect(() => {
    if (!workspaceId) return;

    const fetchGroups = async () => {
      try {
        const { data } = await getGroupsByWorkspace(workspaceId);
        setGroups(data.groups || []);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    fetchGroups();
  }, [workspaceId]);

  useEffect(() => {
  if (!workspaceId) return;

  const fetchRole = async () => {
    try {
      const { data } = await getMyWorkspaceRole(workspaceId);
      setCurrentUserRole(data.role);
      console.log(data.role)
    } catch (err) {
      console.error('Failed to fetch workspace role', err);
    }
  };

  fetchRole();
}, [workspaceId]);
  /* ---------------------------
     Fetch accounts by workspace
  ---------------------------- */
  const fetchAccounts = async () => {
    if (!workspaceId) return;

    try {
      const { data } = await getAccountsByWorkspace(workspaceId);
      setAccounts(data.accounts || []);
      setFilteredAccounts(data.accounts || []);
      setPosts(extractPosts(data.accounts || []));
      console.log(data.accounts)
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [workspaceId]);

  /* ---------------------------
     Group selection
  ---------------------------- */
const handleGroupSelect = async (groupId) => {
  // ALL ACCOUNTS
  if (!groupId || groupId === 'all') {
    setCurrentGroup(null);
    setFilteredAccounts(accounts);
    setPosts(extractPosts(accounts));
    return;
  }

  // GROUP SELECTED
  try {
    const group = groups.find(g => g.group_id === groupId);
    setCurrentGroup(group || null);

    const { data } = await getAccountsByGroup(groupId);

    const groupAccounts = data.accounts || [];
    setFilteredAccounts(groupAccounts);
    setPosts(extractPosts(groupAccounts));
  } catch (err) {
    console.error('Failed to fetch group accounts', err);
  }
};

  /* ---------------------------
     Filters (search + tags)
  ---------------------------- */
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          (p.content || '').toLowerCase().includes(term) ||
          (p.accountName || '').toLowerCase().includes(term)
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(p =>
        (p.tags || []).some(t => selectedTags.includes(t.tag_id))
      );
    }

    return result;
  }, [posts, searchTerm, selectedTags]);

  /* ---------------------------
     Render
  ---------------------------- */
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Topbar />

      <Layout>
        <Sidebar accounts={filteredAccounts} />

        <Content style={{ 
          margin: '24px', 
            padding: '24px', 
            backgroundColor: '#fff',
            overflowY: 'auto', // Cho phép cuộn dọc
            height: 'calc(100vh - 64px - 48px)',
         }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <h2>{viewMode === 'calendar' ? 'Dashboard Calendar' : 'Posts List'}</h2>
              <h4 style={{ margin: 0 }}>
                {currentGroup ? currentGroup.group_name : 'All Accounts'}
              </h4>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Group selector */}
              <Select
                style={{ minWidth: 180 }}
                value={currentGroup ? currentGroup.group_id : 'all'}
                onChange={(value) =>
                  value === 'all' ? handleGroupSelect(null) : handleGroupSelect(value)
                }
              >
                <Option value="all">All Accounts</Option>
                {groups.map(group => (
                  <Option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </Option>
                ))}
              </Select>

              {/* Tag filter */}
              <Select
                mode="multiple"
                allowClear
                placeholder="Filter by tags"
                style={{ minWidth: 200 }}
                value={selectedTags}
                onChange={setSelectedTags}
              >
                {allTags.map(tag => (
                  <Option key={tag.tag_id} value={tag.tag_id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>

              {/* Search */}
              <Input.Search
                allowClear
                placeholder="Search posts..."
                style={{ width: 220 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* View toggle */}
              <Segmented
                options={[
                  { label: 'Calendar', value: 'calendar' },
                  { label: 'List', value: 'list' },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />

              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                New Post
              </Button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'calendar' ? (
            <Calendar events={filteredPosts} />
          ) : (
            <PostsListView
              posts={filteredPosts} 
              userRole={currentUserRole}
              onRefresh={fetchAccounts}
              workspaceId={workspaceId}
               />
          )}
        </Content>
      </Layout>

      <NewPostModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchAccounts}
        accounts={filteredAccounts}
        userRole={currentUserRole}
      />
    </Layout>
  );
};

export default Dashboard;
