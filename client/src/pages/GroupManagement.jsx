import React, { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Select,
  Modal,
  message,
  Tag,
  Input,
  Space,
  Popconfirm,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
  createGroup,
  getGroupsByWorkspace,
  addAccountToGroup,
  removeAccountFromGroup,
  deleteGroup,
} from '../apis/groupAPI';
import { getAccountsByWorkspace } from '../apis/accountAPI';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Option } = Select;

const GroupManagement = () => {
  const workspaceId = localStorage.getItem('workspaceId');
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);


  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [isAddAccountModalVisible, setIsAddAccountModalVisible] =
    useState(false);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] =
    useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------------------------
     Fetch workspace data
  ---------------------------- */
  const fetchData = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const [groupsRes, accountsRes] = await Promise.all([
        getGroupsByWorkspace(workspaceId),
        getAccountsByWorkspace(workspaceId),
      ]);

      setGroups(groupsRes.data.groups || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  /* ---------------------------
     Search filter
  ---------------------------- */
  useEffect(() => {
    const filtered = groups.filter((g) =>
      g.group_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [groups, searchQuery]);

  /* ---------------------------
     Create group
  ---------------------------- */
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      message.error('Please enter a group name');
      return;
    }

    try {
      await createGroup(workspaceId, {
        group_name: newGroupName,
      });

      message.success('Group created');
      setIsCreateGroupModalVisible(false);
      setNewGroupName('');
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Failed to create group');
    }
  };

  /* ---------------------------
     Add account to group
  ---------------------------- */
  const handleAddAccount = async () => {
    if (!selectedGroupId || !selectedAccountId) {
      message.error('Please select both group and account');
      return;
    }

    try {
      await addAccountToGroup(selectedGroupId, selectedAccountId, workspaceId);
      message.success('Account added to group');
      setIsAddAccountModalVisible(false);
      setSelectedAccountId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Failed to add account');
    }
  };

  /* ---------------------------
     Remove account from group
  ---------------------------- */
  const handleRemoveAccount = async (groupId, accountId) => {
    try {
      await removeAccountFromGroup(groupId, accountId, workspaceId);
      message.success('Account removed');
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Failed to remove account');
    }
  };

  /* ---------------------------
     Delete group
  ---------------------------- */
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId, workspaceId);
      message.success('Group deleted');
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Failed to delete group');
    }
  };

  /* ---------------------------
     Helpers
  ---------------------------- */
  const getPlatformIcon = (platform = '') => {
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

  /* ---------------------------
     Table columns
  ---------------------------- */
  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (text, record) => (
        <strong
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/group/${record.group_id}`)}
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
          {(record.Accounts || []).map((account) => (
            <Tag
              key={account.account_id}
              closable
              onClose={() =>
                handleRemoveAccount(record.group_id, account.account_id)
              }
            >
              {getPlatformIcon(account.platform)} {account.account_name}
            </Tag>
          ))}
          {record.Accounts?.length === 0 && <Tag color="red">No accounts</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
  type="primary"
  onClick={() => {
    setSelectedGroup(record);
    setSelectedGroupId(record.group_id);
    setIsAddAccountModalVisible(true);
  }}
>
  Add Account
</Button>

          <Popconfirm
            title="Delete this group?"
            description="This will remove the group and its account assignments."
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => handleDeleteGroup(record.group_id)}
          >
            <Button danger icon={<DeleteOutlined />}> 
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const availableAccounts = React.useMemo(() => {
  if (!selectedGroup) return accounts;

  const existingAccountIds = (selectedGroup.Accounts || []).map(
    (a) => a.account_id
  );

  return accounts.filter(
    (acc) => !existingAccountIds.includes(acc.account_id)
  );
}, [accounts, selectedGroup]);

  /* ---------------------------
     Render
  ---------------------------- */
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Layout>
        <Sidebar accounts={accounts} />

        <Content style={{ margin: 24, padding: 24, background: '#fff' }}>
          <h2>Group Management</h2>

          <Space style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateGroupModalVisible(true)}
            >
              Create Group
            </Button>

            <Input
              placeholder="Search groups"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
            />
          </Space>

          <Table
            rowKey="group_id"
            columns={columns}
            dataSource={filteredGroups}
            loading={loading}
            bordered
            pagination={{ pageSize: 5 }}
          />
        </Content>
      </Layout>

      {/* Add Account Modal */}
      <Modal
        title="Add Account to Group"
        open={isAddAccountModalVisible}
        onCancel={() => {
  setIsAddAccountModalVisible(false);
  setSelectedAccountId(null);
  setSelectedGroup(null);
}}
        onOk={handleAddAccount}
        okText="Add"
      >
        <Select
  style={{ width: '100%' }}
  placeholder="Select account"
  onChange={setSelectedAccountId}
  value={selectedAccountId}
>
  {availableAccounts.map((account) => (
    <Option key={account.account_id} value={account.account_id}>
      {getPlatformIcon(account.platform)} {account.account_name}
    </Option>
  ))}

  {availableAccounts.length === 0 && (
    <Option disabled>No available accounts</Option>
  )}
</Select>
      </Modal>

      {/* Create Group Modal */}
      <Modal
        title="Create Group"
        open={isCreateGroupModalVisible}
        onCancel={() => setIsCreateGroupModalVisible(false)}
        onOk={handleCreateGroup}
        okText="Create"
      >
        <Input
          placeholder="Group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
      </Modal>
    </Layout>
  );
};

export default GroupManagement;
