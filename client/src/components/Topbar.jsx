// Topbar.js
import React, { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { getMyWorkspaces } from '../apis/workspaceAPI';
import logo from '../assets/images/logo.avif';
import { SettingOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Topbar = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const location = useLocation();

  /* ---------------- Fetch workspaces ---------------- */
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await getMyWorkspaces();
        const list = data.workspaces || [];
        setWorkspaces(list);

        const activeId = localStorage.getItem('workspaceId');
        const active =
          list.find((w) => String(w.id) === activeId) || list[0];

        if (active) {
          setCurrentWorkspace(active);
          localStorage.setItem('workspaceId', active.id);
        }
      } catch (err) {
        console.error('Failed to load workspaces', err);
      }
    };

    fetchWorkspaces();
  }, []);

  /* ---------------- Workspace change ---------------- */
  const handleWorkspaceChange = (workspace) => {
    localStorage.setItem('workspaceId', workspace.id);
    window.location.reload(); // simple & safe
  };

   const workspaceMenu = (
    <Menu>
      {/* Workspace list */}
      {workspaces.map(ws => (
        <Menu.Item key={ws.id} onClick={() => handleWorkspaceChange(ws)}>
          {ws.name}
        </Menu.Item>
      ))}

      <Menu.Divider />

      {/* Manage workspace */}
      <Menu.Item key="manage-workspace" icon={<SettingOutlined />}>
        <Link to="/team">Manage workspace</Link>
      </Menu.Item>
    </Menu>
  );
  /* ---------------- Active menu ---------------- */
  const selectedKey = (() => {
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/tags')) return 'tags';
    if (location.pathname.startsWith('/groups')) return 'groups';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    return '';
  })();

  return (
    <Header
      style={{
        padding: '0 24px',
        backgroundColor: '#001529',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}
    >
      {/* -------- Logo / Brand -------- */}
      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
  }}
>
    <img
      src={logo}
      alt="Social Link"
      style={{
        height: 28,
        maxWidth: 100,
        objectFit: 'contain',
        filter: 'invert(1)',
      }}
    />
  </div>

      {/* -------- Navigation -------- */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        style={{ flex: 1 }}
      >
        <Menu.Item key="dashboard">
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>

        <Menu.Item key="tags">
          <Link to="/tags">Tags</Link>
        </Menu.Item>

        <Menu.Item key="groups">
          <Link to="/groups-management">Groups</Link>
        </Menu.Item>

        <Menu.Item key="analytics">
          <Link to="/analytics">Analytics</Link>
        </Menu.Item>
      </Menu>

      {/* -------- Workspace selector -------- */}
      {currentWorkspace && (
        <Dropdown overlay={workspaceMenu} trigger={['click']}>
          <div
            style={{
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {currentWorkspace.name}
            <DownOutlined />
          </div>
        </Dropdown>
      )}
    </Header>
  );
};

export default Topbar;
