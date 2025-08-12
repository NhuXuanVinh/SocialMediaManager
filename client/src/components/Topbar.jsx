// Topbar.js
import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
const { Header } = Layout;

const Topbar = () => {
  const profileMenu = (
    <Menu>
      <Menu.Item key="0">Profile</Menu.Item>
      <Menu.Item key="1">Settings</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2">Logout</Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ padding: '0 20px', backgroundColor: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Menu theme="dark" mode="horizontal" style={{ flex: 1 }}>
        <Menu.Item key="1"><Link to="/dashboard">Dashboard</Link></Menu.Item>
        <Menu.Item key="2">Analytics</Menu.Item>
        <Menu.Item key="3"><Link to="/groups-management">Groups</Link></Menu.Item>
        <Menu.Item key="4"><Link to="/dashboard">Posts</Link></Menu.Item>
      </Menu>
      <Dropdown overlay={profileMenu} trigger={['click']}>
        <Avatar
        style={{ cursor: 'pointer', backgroundColor: '#ff4d4f', color: '#fff', fontSize: '24px' }}
        size={48}
        icon={<UserOutlined />}
        />
      </Dropdown>
    </Header>
  );
};

export default Topbar;
