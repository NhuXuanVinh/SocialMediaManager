import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, message, Tag, Popconfirm, Space } from 'antd';
import {
  getGroupsByUser,
  addAccountToGroup,
  removeAccountFromGroup,
} from '../apis/groupAPI';
import { getAccountsByUser } from '../apis/accountAPI';
const { Option } = Select;

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch groups and accounts for the user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId'); // Replace with dynamic us er ID from authentication
        const groupsResponse = await getGroupsByUser(userId);
        console.log(groupsResponse)
        const accountsResponse = await getAccountsByUser(userId);
        console.log(accountsResponse)
        
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

  const handleAddAccount = async () => {
    if (!selectedGroup || !selectedAccount) {
      message.error('Please select a group and an account');
      return;
    }

    try {
      await addAccountToGroup(selectedGroup, selectedAccount);
      message.success('Account added to group successfully');
      // Refresh the group data
      const userId = 1; // Replace with dynamic user ID
      const groupsResponse = await getGroupsByUser(userId);
      setGroups(groupsResponse.data.groups);
      setIsModalVisible(false);
    } catch (err) {
      console.error('Error adding account to group:', err);
      message.error('Failed to add account to group');
    }
  };

  const handleRemoveAccount = async (groupId, accountId) => {
    try {
      await removeAccountFromGroup(groupId, accountId);
      message.success('Account removed from group successfully');
      // Refresh the group data
      const userId = 1; // Replace with dynamic user ID
      const groupsResponse = await getGroupsByUser(userId);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      console.error('Error removing account from group:', err);
      message.error('Failed to remove account from group');
    }
  };

  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (text) => <strong>{text}</strong>,
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
              {account.account_name} - ({account.platform})
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
    <div>
      <h2 style={{ marginBottom: '20px' }}>Group Management</h2>
      <Table
        dataSource={groups}
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
            <Option key={account.account_id} value={account.id}>
              {account.account_name} ({account.platform})
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default GroupManagement;
