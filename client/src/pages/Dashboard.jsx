// Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Button, Segmented, Input, Select } from 'antd';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Calendar from '../components/Calendar/Calendar';
import NewPostModal from '../components/NewPostModal';
import { getGroupsByUser } from '../apis/groupAPI';
import { getAccountsByUser } from '../apis/accountAPI';
import PostsListView from '../components/PostsListView';
import { getTags } from '../apis/tagAPI';


const { Content } = Layout;
const { Option } = Select;



const Dashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [posts, setPosts] = useState([]);

  const [viewMode, setViewMode] = useState('calendar');

  // NEW: search + MULTI tag filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); // 👈 now an array
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
  getTags({ limit: 100 })
    .then(res => setAllTags(res.data.data || []))
    .catch(() => console.error('Failed to load tags'));
}, []);

  const handleOpenModal = () => {
    setIsModalVisible(true);
    console.log(filteredAccounts);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Extract posts from accounts and attach mock tags
const extractPosts = (accounts) => {
  const posts = [];
  accounts.forEach((account) => {
    (account.Posts || []).forEach((post) => {
      posts.push({
        post_id: post.post_id,
        content: post.content,
        date: post.scheduledAt
          ? new Date(post.scheduledAt)
          : new Date(post.createdAt),
        accountName: account.account_name,
        platform: account.platform,
        postLink: post.post_link,
        status: post.status,
        tags: post.Tags || [], // ✅ real tags
      });
    });
  });
  return posts;
};

  // Group selection (shared for both views)
  const handleGroupSelect = (groupId) => {
    console.log('Selected group:', groupId);
    if (groupId !== null) {
      const selectedGroup = groups.find((group) => group.group_id === groupId);
      setCurrentGroup(selectedGroup || null);

      const groupAccounts = selectedGroup?.Accounts || [];
      setFilteredAccounts(groupAccounts);

      const extractedPosts = extractPosts(groupAccounts);
      setPosts(extractedPosts);
    } else {
      // All accounts
      setCurrentGroup(null);
      setFilteredAccounts(accounts);
      const extractedPosts = extractPosts(accounts);
      setPosts(extractedPosts);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const { data } = await getGroupsByUser(userId);
        setGroups(data.groups);
        console.log(data.groups);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const { data } = await getAccountsByUser(userId);
        setAccounts(data.accounts);
        setFilteredAccounts(data.accounts);

        const extractedPosts = extractPosts(data.accounts);
        setPosts(extractedPosts);

        console.log(data.accounts);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, []);


  // Apply search + MULTI tag filter
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.content || '').toLowerCase().includes(term) ||
          (p.accountName || '').toLowerCase().includes(term)
      );
    }

    if (selectedTags.length > 0) {
  result = result.filter((p) =>
    (p.tags || []).some((t) => selectedTags.includes(t.tag_id))
  );
}


    return result;
  }, [posts, searchTerm, selectedTags]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Layout>
        {/* Sidebar only shows accounts (filtered by group) */}
        <Sidebar accounts={filteredAccounts} />

        <Content style={{ margin: '24px', padding: '24px', backgroundColor: '#fff' }}>
          {/* Actions row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ marginBottom: 4 }}>
                {viewMode === 'calendar' ? 'Dashboard Calendar' : 'Posts List'}
              </h2>
              <h4 style={{ margin: 0 }}>
                {currentGroup ? currentGroup.group_name : 'All Accounts'}
              </h4>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Group selector – affects both views */}
              <Select
                size="middle"
                style={{ minWidth: 180 }}
                value={currentGroup ? currentGroup.group_id : 'all'}
                onChange={(value) => {
                  if (value === 'all') {
                    handleGroupSelect(null);
                  } else {
                    handleGroupSelect(value);
                  }
                }}
              >
                <Option value="all">All Accounts</Option>
                {groups.map((group) => (
                  <Option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </Option>
                ))}
              </Select>

              {/* MULTI-tag filter */}
              <Select
                mode="multiple"
                allowClear
                placeholder="Filter by tags"
                style={{ minWidth: 200 }}
                value={selectedTags}
                onChange={(value) => setSelectedTags(value || [])}
              >
               {allTags.map((tag) => (
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

              <Button type="primary" onClick={handleOpenModal}>
                New Post
              </Button>
            </div>
          </div>

          {/* Main content: Calendar OR List, both using filteredPosts */}
          {viewMode === 'calendar' ? (
            <Calendar events={filteredPosts || []} />
          ) : (
            <PostsListView posts={filteredPosts || []} />
          )}
        </Content>
      </Layout>

      <NewPostModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onPost={handleCloseModal}
        accounts={filteredAccounts}
      />
    </Layout>
  );
};

export default Dashboard;
