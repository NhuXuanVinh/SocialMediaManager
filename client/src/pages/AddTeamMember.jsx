import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Form,
  Input,
  Table,
  Select,
  message,
  Popconfirm,
  Space,
  Tag,
} from 'antd';
import Topbar from '../components/Topbar';
import {
  addWorkspaceMember,
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from '../apis/workspaceAPI';

const { Content } = Layout;
const { Option } = Select;

const AddTeamMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [form] = Form.useForm();

  const workspaceId = localStorage.getItem('ownerWorkspaceId');
  const currentUserId = Number(localStorage.getItem('userId'));
  const workspaceName = localStorage.getItem('ownerWorkspaceName');

  /* ---------------- Fetch Members ---------------- */
  const fetchMembers = async () => {
    try {
      const { data } = await getWorkspaceMembers(workspaceId);
      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to load members');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  /* ---------------- Add Member ---------------- */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await addWorkspaceMember(workspaceId, {
        userIdentifier: values.userIdentifier,
        role: values.role,
      });

      message.success('Member added successfully');
      form.resetFields();
      fetchMembers();
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to add member'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Update Role ---------------- */
  const handleRoleChange = async (memberId, newRole) => {
    setUpdatingId(memberId);
    try {
      await updateWorkspaceMemberRole(
        workspaceId,
        memberId,
        newRole
      );
      message.success('Role updated');
      fetchMembers();
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to update role'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Remove Member ---------------- */
  const handleRemove = async (memberId) => {
    setRemovingId(memberId);
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      message.success('Member removed');
      fetchMembers();
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to remove member'
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* ---------------- Table ---------------- */
  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.username || user?.email,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => {
        const isOwner = role === 'owner';
        const isSelf = record.user_id === currentUserId;

        if (isOwner) {
          return <Tag color="gold">Owner</Tag>;
        }

        return (
          <Select
            value={role}
            style={{ width: 140 }}
            disabled={isOwner || isSelf}
            loading={updatingId === record.id}
            onChange={(newRole) =>
              handleRoleChange(record.id, newRole)
            }
          >
            <Option value="admin">Admin</Option>
            <Option value="publisher">Publisher</Option>
            <Option value="editor">Editor</Option>
          </Select>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isOwner = record.role === 'owner';

        if (isOwner) return null;

        return (
          <Popconfirm
            title="Remove this member?"
            description="This action cannot be undone."
            okText="Remove"
            cancelText="Cancel"
            onConfirm={() => handleRemove(record.id)}
          >
            <Button
              danger
              size="small"
              loading={removingId === record.id}
            >
              Remove
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Content style={{ margin: 24, padding: 24, background: '#fff' }}>
        <h2>{workspaceName} || Your Workspace</h2>
        <p>Manage your workspace</p>

        {/* -------- Add Member Form -------- */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name="userIdentifier"
            rules={[{ required: true, message: 'Enter user email or ID' }]}
          >
            <Input placeholder="User email" />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true }]}
            initialValue="editor"
          >
            <Select style={{ width: 160 }}>
              <Option value="admin">Admin</Option>
              <Option value="publisher">Publisher</Option>
              <Option value="editor">Editor</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Add Member
          </Button>
        </Form>

        {/* -------- Member List -------- */}
        <h3>Workspace Members</h3>
        <Table
          rowKey="id"
          dataSource={members}
          columns={columns}
          bordered
          pagination={false}
        />
      </Content>
    </Layout>
  );
};

export default AddTeamMember;
