// Sidebar.js
import React, {useState} from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;

const getPlatformIcon = (platform) => {
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
const Sidebar = ({groups, accounts, onGroupSelect}) => {
  const [openKeys, setOpenKeys] = useState([])
  const handleOpenChange = (keys) => {
    if (keys.length === 0) {
      // If no keys are open, close all
      setOpenKeys([]);
    } else {
      // Open only the last clicked submenu
      const latestOpenKey = keys[keys.length - 1];
      setOpenKeys([latestOpenKey]);
    }
  };

  return (
    <Sider
      width={200}
      className="site-layout-background"
      style={{ minHeight: '100vh' }}
    >
      <Menu
       mode="inline" 
       style={{ height: '100%', borderRight: 0 }}
       openKeys={openKeys} // Control which submenus are open
        onOpenChange={handleOpenChange}
      >
        {/* Social Accounts Submenu */}
        <SubMenu
          key="sub1"
          icon={<UserOutlined />}
          title="All Accounts"
          onTitleClick={()=>onGroupSelect(null)}
        >
          {accounts.length > 0 ? (
              accounts.map((account) => (
                <Menu.Item
                  key={`account-${account.account_id}`}
                  icon={getPlatformIcon(account.platform)}
                >
                  {account.account_name}
                </Menu.Item>
              ))
            ) : (
              <Menu.Item key={`no-accounts`}>
                No accounts added
              </Menu.Item>
            )}
        </SubMenu>

        <Menu.Divider />

        {/* Render dynamic groups */}
        {groups.map((group) => (
          <SubMenu
            key={`group-${group.group_id}`}
            icon={<UserOutlined />}
            title={group.group_name}
            onTitleClick={() => onGroupSelect(group.group_id)}
          >
            {group.Accounts.length > 0 ? (
              group.Accounts.map((account) => (
                <Menu.Item
                  key={`account-${account.account_id}`}
                  icon={getPlatformIcon(account.platform)}
                >
                  {account.account_name}
                </Menu.Item>
              ))
            ) : (
              <Menu.Item key={`no-accounts-${group.group_id}`}>
                No accounts added
              </Menu.Item>
            )}
          <Menu.Divider />
          </SubMenu>
          
        ))}


        {/* Divider */}
        <Menu.Divider />

        {/* Connect Your Social Menu Item */}
        <Menu.Item key="7" icon={<PlusOutlined />}>
          Connect Your Social
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
