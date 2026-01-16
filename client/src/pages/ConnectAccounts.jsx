import React, { useEffect, useState } from 'react';
import {
  Layout,
  Button,
  Table,
  Modal,
  Tag,
  message,
  Popconfirm,
  Space,
} from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  PlusOutlined,
  InstagramOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import Topbar from '../components/Topbar';
import { getAccountsByWorkspace } from '../apis/accountAPI';
import axiosClient from '../apis/axiosClient';

const { Content } = Layout;

const platforms = [
  {
    key: 'facebook',
    name: 'Facebook',
    icon: <FacebookOutlined />,
  },
  {
    key: 'twitter',
    name: 'Twitter',
    icon: <TwitterOutlined />,
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: <LinkedinOutlined />,
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: <InstagramOutlined />,
  },
];

const ConnectAccounts = () => {
  const workspaceId = localStorage.getItem('workspaceId');

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  /* ---------------- Fetch accounts ---------------- */
  const fetchAccounts = async () => {
    try {
      const { data } = await getAccountsByWorkspace(workspaceId);
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to load connected channels');
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAccounts();
  }, [workspaceId]);

  /* ---------------- Start OAuth ---------------- */
  const startFlow = async (platform) => {
    try {
      setLoading((p) => ({ ...p, [platform]: true }));

      const { data } = await axiosClient.post(
        `http://localhost:5000/api/auth/${platform}`,
        { workspaceId }
      );

      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error(err);
      message.error(`Failed to connect ${platform}`);
    } finally {
      setLoading((p) => ({ ...p, [platform]: false }));
    }
  };

  /* ---------------- Remove Account ---------------- */
  const handleRemoveAccount = async (accountId) => {
    try {
      setRemovingId(accountId);

      await axiosClient.delete(
        `http://localhost:5000/api/account/${accountId}`,
        {
          data: { workspaceId },
        }
      );

      message.success('Account removed');
      fetchAccounts();
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to remove account';

      message.error(msg);
    } finally {
      setRemovingId(null);
    }
  };

  /* ---------------- Table ---------------- */
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
      title: 'Account',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: 'Profile',
      dataIndex: 'account_url',
      key: 'account_url',
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            View
          </a>
        ) : (
          <span style={{ opacity: 0.6 }}>—</span>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Connected</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Remove this account?"
            description="This will disconnect it from the workspace."
            okText="Remove"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => handleRemoveAccount(record.account_id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={removingId === record.account_id}
            >
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Layout>
        <Content style={{ margin: 24, padding: 24, background: '#fff' }}>
          <h2>Connected Channels</h2>
          <p>Manage social media accounts connected to this workspace.</p>

          {/* Action */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Connect Channel
            </Button>
          </div>

          {/* Table */}
          <Table
            rowKey="account_id"
            dataSource={accounts}
            columns={columns}
            bordered
            pagination={false}
          />
        </Content>
      </Layout>

      {/* -------- Connect Modal -------- */}
      <Modal
        title="Connect a channel"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        {platforms.map((p) => (
          <Button
            key={p.key}
            icon={p.icon}
            block
            style={{ marginBottom: 12 }}
            loading={loading[p.key]}
            onClick={() => startFlow(p.key)}
          >
            Connect {p.name}
          </Button>
        ))}
      </Modal>
    </Layout>
  );
};

export default ConnectAccounts;
