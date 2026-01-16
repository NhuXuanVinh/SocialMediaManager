// components/previews/PostPreviewPanel.jsx
import React, { useEffect, useState } from 'react';
import { Tabs, Avatar } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import FacebookPreview from './FacebookPreview';
import TwitterPreview from './TwitterPreview';
import InstagramPreview from './InstagramPreview';
import LinkedInPreview from './LinkedInPreview';

const { TabPane } = Tabs;

const getPlatformIcon = (platform) => {
  if (!platform) return <UserOutlined />;
  switch ((platform || '').toLowerCase()) {
    case 'facebook':
      return <FacebookOutlined style={{ color: '#1877F2' }} />;
    case 'twitter':
    case 'x':
      return <TwitterOutlined style={{ color: '#1DA1F2' }} />;
    case 'instagram':
      return <InstagramOutlined style={{ color: '#E1306C' }} />;
    case 'linkedin':
      return <LinkedinOutlined style={{ color: '#0077B5' }} />;
    default:
      return <UserOutlined />;
  }
};

const getPlatformColor = (platform) => {
  switch ((platform || '').toLowerCase()) {
    case 'facebook':
      return '#1877F2';
    case 'twitter':
    case 'x':
      return '#1DA1F2';
    case 'instagram':
      return '#E1306C';
    case 'linkedin':
      return '#0077B5';
    default:
      return '#999999';
  }
};

const PostPreviewPanel = ({
  selectedAccounts,
  postContent,
  imageList,
  postOption,
  scheduledDate,
}) => {
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    if (!selectedAccounts || selectedAccounts.length === 0) {
      setActiveKey(null);
      return;
    }
    if (!activeKey) {
      setActiveKey(String(selectedAccounts[0].account_id));
      return;
    }
    const exists = selectedAccounts.some(
      (acc) => String(acc.account_id) === String(activeKey)
    );
    if (!exists) {
      setActiveKey(String(selectedAccounts[0].account_id));
    }
  }, [selectedAccounts, activeKey]);

  const renderPreview = (account) => {
    const platform = (account.platform || '').toLowerCase();
    const commonProps = {
      account,
      postContent,
      imageList,
      postOption,
      scheduledDate,
    };

    if (platform === 'facebook') return <FacebookPreview {...commonProps} />;
    if (platform === 'twitter' || platform === 'x')
      return <TwitterPreview {...commonProps} />;
    if (platform === 'instagram') return <InstagramPreview {...commonProps} />;
    if (platform === 'linkedin') return <LinkedInPreview {...commonProps} />;

    return <FacebookPreview {...commonProps} />;
  };

  if (!selectedAccounts || selectedAccounts.length === 0) {
    return (
      <div
        style={{
          color: '#999',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 12px',
        }}
      >
        Select at least one account on the left to see a live preview.
      </div>
    );
  }

  return (
    <div className="post-preview-panel">
      <style>
        {`
          .fb-preview-btn {
            border: none;
            background: transparent;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            color: #65676b;
          }
          .fb-preview-btn:hover {
            background-color: #f2f2f2;
          }

          .post-preview-panel {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .post-preview-panel .ant-tabs {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .post-preview-panel .ant-tabs-content-holder {
            flex: 1;
            min-height: 0;
          }

          .post-preview-panel .ant-tabs-content {
            height: 100%;
          }

          .post-preview-panel .ant-tabs-tabpane {
            height: 100%;
          }
        `}
      </style>

      <Tabs
        activeKey={activeKey || String(selectedAccounts[0].account_id)}
        onChange={setActiveKey}
        type="card"
        size="small"
      >
        {selectedAccounts.map((account) => (
          <TabPane
            key={String(account.account_id)}
            tab={
              <span>
                {getPlatformIcon(account.platform)} {account.account_name}
              </span>
            }
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              {/* Header inside preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 12,
                  color: '#666',
                }}
              >
                <Avatar
                  size="small"
                  icon={getPlatformIcon(account.platform)}
                  style={{
                    backgroundColor: '#fff',
                    border: `1px solid ${getPlatformColor(account.platform)}`,
                  }}
                />
                <span>
                  Previewing{' '}
                  <strong>{account.account_name}</strong> on{' '}
                  {(account.platform || '').charAt(0).toUpperCase() +
                    (account.platform || '').slice(1)}
                </span>
              </div>

              {/* Preview content */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {renderPreview(account)}
              </div>
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default PostPreviewPanel;
