import React from 'react';
import { Layout, Menu } from 'antd';
import {  UserOutlined, PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

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

const Sidebar = ({ accounts, onAccountSelect, selectedAccountId, groupName }) => {
  const navigate = useNavigate();

  return (
    <Sider
      width={200}
      className="site-layout-background"
      style={{ minHeight: '100vh', }}
    >
      <Menu mode="inline"
      selectedKeys={selectedAccountId ? [`account-${selectedAccountId}`] : 'all-accounts'}
      style={{ height: '100%', borderRight: 0 }}>
        <Menu.ItemGroup key="accounts-group">
          <Menu.Item
              key="all-accounts"
              icon={<AppstoreOutlined />}
              onClick={() => onAccountSelect(null)}
            >
              {groupName || 'All Accounts'}
            </Menu.Item>

<Menu.Divider />
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <Menu.Item
                key={`account-${account.account_id}`}
                icon={getPlatformIcon(account.platform)}
                onClick={() => onAccountSelect(account.account_id)}
              >
                {account.account_name}
              </Menu.Item>
            ))
          ) : (
            <Menu.Item key="no-accounts">No accounts added</Menu.Item>
          )}
        </Menu.ItemGroup>

        <Menu.Divider />

        <Menu.Item
          key="connect"
          icon={<PlusOutlined />}
          onClick={() => navigate('/connect')}
        >
          Connect Your Social
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
