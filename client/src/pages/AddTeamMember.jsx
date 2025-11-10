import React, { useState, useEffect } from 'react';
import { Layout, Button, Form, Input, Table, Select, message } from 'antd';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getAccountsByUser } from '../apis/accountAPI';
import { getGroupsByUser } from '../apis/groupAPI';

const { Content } = Layout;
const { Option } = Select;

const AddTeamMember = () => {
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const [accRes, groupRes] = await Promise.all([
          getAccountsByUser(userId),
          getGroupsByUser(userId),
        ]);

        setAccounts(accRes.data.accounts || []);
        setGroups(groupRes.data.groups || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handlePermissionChange = (accountId, value) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [accountId]: value,
    }));
  };

  const handleSubmit = (values) => {
    console.log('Team Member Info:', values);
    console.log('Selected Permissions:', selectedPermissions);

    message.success(`Team member ${values.userId} added successfully (mock).`);
    form.resetFields();
    setSelectedPermissions({});
  };

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <span style={{ textTransform: 'capitalize' }}>{platform}</span>
      ),
    },
    {
      title: 'Account Name',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: 'Permission',
      key: 'permission',
      render: (_, record) => (
        <Select
          value={selectedPermissions[record.id] || 'read'}
          style={{ width: 150 }}
          onChange={(value) => handlePermissionChange(record.id, value)}
        >
          <Option value="read">Read Only</Option>
          <Option value="post">Create Post Access</Option>
          <Option value="admin">Publish Access</Option>
        </Select>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />
      <Layout>
        <Sidebar groups={groups} accounts={accounts} />

        <Content style={{ margin: '24px', padding: '24px', backgroundColor: '#fff' }}>
          <h2>Add Team Member</h2>
          <p style={{ marginBottom: '20px' }}>
            Add a new team member by entering their user ID and assigning permissions for each connected social media account.
          </p>

          <Form
            form={form}
            layout="inline"
            onFinish={handleSubmit}
            style={{ marginBottom: '20px' }}
          >
            <Form.Item
              label="User ID"
              name="userId"
              rules={[{ required: true, message: 'Please enter a user ID' }]}
            >
              <Input placeholder="Enter user ID" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Member
              </Button>
            </Form.Item>
          </Form>

          <h3>Assign Permissions</h3>
          <Table
            dataSource={accounts}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddTeamMember;
