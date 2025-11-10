import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Card } from 'antd';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Calendar from '../components/Calendar/Calendar';
import NewPostModal from '../components/NewPostModal';
import { getGroupsByUser } from '../apis/groupAPI'; // Import the API call for fetching groups
import { getAccountsByUser } from '../apis/accountAPI';

const { Content } = Layout;

const Dashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [posts, setPosts] = useState([]);
  const handleOpenModal = () => {
    setIsModalVisible(true);
    console.log(filteredAccounts)
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };
  const handleGroupSelect = (groupId) => {
    console.log(groupId)
    if(groupId!==null){
      const selectedGroup = groups.find(group => group.group_id === groupId);
      setCurrentGroup(selectedGroup);
      setFilteredAccounts(selectedGroup.Accounts)
      const extractedPosts = extractPosts(selectedGroup.Accounts)
      setPosts(extractedPosts)
    }
    else{
      setCurrentGroup(null);
      setFilteredAccounts(accounts)
      const extractedPosts = extractPosts(accounts); // Extract posts
        setPosts(extractedPosts); // Store posts
    }
    
  };

  const extractPosts = (accounts) => {
    const posts = [];
  accounts.forEach((account) => {
    account.Posts.forEach((post) => {
      posts.push({
        content: post.content,
        date: post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt),
        accountName: account.account_name,
        platform: account.platform,
        postLink: post.post_link,
        status: post.status,
      });
    });
  });
    return posts;
  };

  
  const handlePost = (content, emoji, images) => {
    console.log("Post Content:", content);
    console.log("Selected Emoji:", emoji);
    console.log("Images:", images);
    setIsModalVisible(false);
    // Perform any API calls or further actions here
  };

  // Fetch groups and their accounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const { data } = await getGroupsByUser(userId); // Fetch groups and accounts from the API
        setGroups(data.groups); // Assuming API returns { groups: [...] }
        console.log(data.groups)
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    fetchGroups();
  }, []);
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const { data } = await getAccountsByUser(userId); // Fetch groups and accounts from the API
        setAccounts(data.accounts); // Assuming API returns { groups: [...] }
        setFilteredAccounts(data.accounts)
        const extractedPosts = extractPosts(data.accounts); // Extract posts
        setPosts(extractedPosts); // Store posts
        console.log(data.accounts)
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    fetchAccounts();
  }, []);

  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Accounts',
      key: 'accounts',
      render: (_, record) => (
        <ul>
          {record.Accounts.map((account) => (
            <li key={account.id}>
              {account.account_name}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Topbar spans the full width */}
      <Topbar />

      {/* Sidebar and main content below the Topbar */}
      <Layout>
        <Sidebar groups={groups} accounts={accounts}  onGroupSelect={handleGroupSelect}/>
        <Content style={{ margin: '24px', padding: '24px', backgroundColor: '#fff' }}>
          {/* New Post Button aligned to the right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <Button type="primary" onClick={handleOpenModal}>New Post</Button>
          </div>

          {/* Calendar Component */}
          <h2>Dashboard Calendar</h2>
          <h3>{currentGroup ? currentGroup.group_name : "All Accounts"}</h3>
          <Calendar events ={posts || []}/>
        </Content>
      </Layout>

      {/* New Post Modal */}
      <NewPostModal 
        isVisible={isModalVisible} 
        onClose={handleCloseModal} 
        onPost={handleCloseModal}
        accounts={filteredAccounts} // Use accounts from groups
      />
    </Layout>
  );
};

export default Dashboard;
