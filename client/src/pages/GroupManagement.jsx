import React, { useState, useEffect } from 'react';
import {Layout, Table, Button, Select, Modal, message, Tag, Input, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
  createGroup,
  getGroupsByUser,
  addAccountToGroup,
  removeAccountFromGroup,
} from '../apis/groupAPI';
import { getAccountsByUser } from '../apis/accountAPI';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined, 
} from '@ant-design/icons';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Option } = Select;

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate();
  // Fetch groups and accounts for the user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const groupsResponse = await getGroupsByUser(userId);
        const accountsResponse = await getAccountsByUser(userId);
        setGroups(groupsResponse.data.groups);
        setAccounts(accountsResponse.data.accounts);
      } catch (err) {
        console.error('Error fetching data:', err);
        message.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set filtered groups based
  useEffect(() => {
    // Filter groups based on search query
    const filtered = groups.filter((group) =>
      group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);


  const handleGroupSelect = (groupId) => {
    if(groupId!==null){
      const selectedGroup = groups.find(group => group.group_id === groupId);
      setCurrentGroup(selectedGroup);
    }
    else{
      setCurrentGroup(null);
    }
    
  };
  const handleCreateGroup = async () => {
    if (!newGroupName) {
      message.error('Please enter a group name');
      return;
    }

    try {
      await createGroup(userId, newGroupName);
      message.success('Group created successfully');
      setIsCreateGroupModalVisible(false);
      setNewGroupName('');
      // Refresh groups after creation
      const groupsResponse = await getGroupsByUser(userId);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      console.error('Error creating group:', err);
      message.error('Failed to create group');
    }
  };
  const handleAddAccount = async () => {
    if (!selectedGroup || !selectedAccount) {
      message.error('Please select a group and an account');
      return;
    }

    try {
      await addAccountToGroup(selectedGroup, selectedAccount);
      message.success('Account added to group successfully');
      // Refresh the group data
      const groupsResponse = await getGroupsByUser(userId);
      setGroups(groupsResponse.data.groups);
      setIsModalVisible(false);
    } catch (err) {
      console.error('Error adding account to group:', err);
      message.error('Failed to add account to group');
    }
  };

  const handleViewGroupDetails = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleRemoveAccount = async (groupId, accountId) => {
    try {
      await removeAccountFromGroup(groupId, accountId);
      message.success('Account removed from group successfully');
      // Refresh the group data
      const groupsResponse = await getGroupsByUser(userId);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      console.error('Error removing account from group:', err);
      message.error('Failed to remove account from group');
    }
  };

  const getPlatformIcon = (platform) => {
    if (!platform) {
      // Return a default icon if platform is undefined or null
      return <UserOutlined />;
    }
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <FacebookOutlined />;
      case 'twitter':
        return <TwitterOutlined />;
      case 'instagram':
        return <InstagramOutlined />;
      case 'linkedin':
        return <LinkedinOutlined />;
      default:
        return <UserOutlined />;
    }
  };
  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (text, record) => (
        <strong
          onClick={() => handleViewGroupDetails(record.group_id)}
        >
          {text}
        </strong>
      ),
    },
    {
      title: 'Accounts',
      key: 'accounts',
      render: (_, record) => (
        <Space direction="vertical">
          {record.Accounts.map((account) => (
            <Tag
              key={account.account_id}
              color="blue"
              closable
              onClose={() => handleRemoveAccount(record.group_id, account.account_id)}
            >
              {account.account_name} ({account.platform})
            </Tag>
          ))}
          {record.Accounts.length === 0 && <Tag color="red">No accounts added</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedGroup(record.group_id);
            setIsModalVisible(true);
          }}
        >
          Add Account
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Topbar spans the full width */}
      <Topbar />

      {/* Sidebar and main content below the Topbar */}
      <Layout>
        <Sidebar groups={groups} accounts={accounts} onGroupSelect={handleGroupSelect} />
        <Content style={{ margin: '24px', padding: '24px', backgroundColor: '#fff' }}>
        <div>
      <h2 style={{ marginBottom: '20px' }}>Group Management</h2>
      <Space style={{ marginBottom: '20px', width: '100%' }}>
      <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateGroupModalVisible(true)}
              >
                Create Group
              </Button>
              <Input
                placeholder="Search Groups"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: '300px' }}
              />
              
            </Space>
      <Table
        dataSource={filteredGroups}
        columns={groupColumns}
        rowKey="group_id"
        loading={loading}
        bordered
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      {/* Add Account Modal */}
      <Modal
        title="Add Account to Group"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddAccount}
        okText="Add Account"
        cancelText="Cancel"
      >
        <p>Select an account to add to the group:</p>
        <Select
          style={{ width: '100%' }}
          placeholder="Select an account"
          onChange={(value) => setSelectedAccount(value)}
        >
          {accounts.map((account) => (
            <Option key={account.account_id} value={account.account_id}>
          <span style={{ marginRight: 8 }}>
            {getPlatformIcon(account.platform)}
          </span>
              {account.account_name}
            </Option>
          ))}
        </Select>
      </Modal>

      <Modal
              title="Create Group"
              visible={isCreateGroupModalVisible}
              onCancel={() => setIsCreateGroupModalVisible(false)}
              onOk={handleCreateGroup}
              okText="Create"
              cancelText="Cancel"
            >
              <p>Enter the name of the group:</p>
              <Input
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </Modal>
    </div>
        </Content>
      </Layout>
    </Layout>
    
  );
};

export default GroupManagement;
