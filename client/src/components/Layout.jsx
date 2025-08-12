// ReusableLayout.jsx
import React from 'react';
import { Layout, Button } from 'antd';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import CalendarComponent from './CalendarComponent';
import NewPostModal from './NewPostModal';

const { Content } = Layout;

const Layout = ({
  groups,
  isModalVisible,
  handleOpenModal,
  handleCloseModal,
  handlePost,
  children
}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Topbar spans the full width */}
      <Topbar />

      {/* Sidebar and main content below the Topbar */}
      <Layout>
        <Sidebar groups={groups} />
        <Content style={{ margin: '24px', padding: '24px', backgroundColor: '#fff' }}>
          {/* Render children content */}
          {children}
        </Content>
      </Layout>

      {/* New Post Modal */}
    </Layout>
  );
};

export default Layout;
