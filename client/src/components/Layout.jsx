import React from 'react';
import { Layout } from 'antd';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const { Content } = Layout;

const ReusableLayout = ({ accounts, children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar />

      <Layout>
        <Sidebar accounts={accounts} />

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReusableLayout;
