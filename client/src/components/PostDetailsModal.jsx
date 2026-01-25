import React from 'react';
import { Modal, Typography, Space, Tag, Image, Divider, Button } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;

const platformIcons = {
  facebook: <FacebookOutlined style={{ color: '#1877F2' }} />,
  twitter: <TwitterOutlined style={{ color: '#1DA1F2' }} />,
  instagram: <InstagramOutlined style={{ color: '#E1306C' }} />,
  linkedin: <LinkedinOutlined style={{ color: '#0077B5' }} />,
};

const formatNumber = (n) =>
  n == null ? '-' : Intl.NumberFormat().format(n);

const PostDetailsModal = ({ open, onClose, post }) => {
  if (!post) return null;

  const insight = post.PostInsights?.[0];
  const showInsights = post.status === 'posted' && insight;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={720}
      title={
        <Space>
          {platformIcons[post.platform]}
          <span>Post details</span>
        </Space>
      }
      footer={[
        post.postLink && (
          <Button
            key="view"
            type="primary"
            href={post.postLink}
            target="_blank"
          >
            View on platform
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {/* Meta */}
      <Space direction="vertical" size={2}>
        <Text type="secondary">
          {post.accountName} • {post.platform}
        </Text>
        <Text type="secondary">
          {moment(post.start).format('MMM D, YYYY • HH:mm')}
        </Text>
        <Tag color={post.status === 'posted' ? 'green' : 'blue'}>
          {post.status}
        </Tag>
      </Space>

      <Divider />

      {/* Content */}
      <Paragraph
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 15,
        }}
      >
        {post.content || <i>No content</i>}
      </Paragraph>

      {/* Media */}
      {post.PostMedia?.length > 0 && (
        <>
          <Divider />
          <Image.PreviewGroup>
            <Space wrap>
              {post.PostMedia.map((m) => (
                <Image
                  key={m.media_id || m.url}
                  src={m.url}
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover', borderRadius: 6 }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </>
      )}

      {/* Insights */}
      {showInsights && (
        <>
          <Divider />
          <Title level={5}>Performance</Title>

          <Space size={20} style={{ fontSize: 14 }}>
            <span>
              <EyeOutlined /> {formatNumber(insight.impressions)}
            </span>
            <span>
              <LikeOutlined /> {formatNumber(insight.likes)}
            </span>
            <span>
              <MessageOutlined /> {formatNumber(insight.comments)}
            </span>
            <span>
              <ShareAltOutlined /> {formatNumber(insight.shares)}
            </span>
            <Text type="secondary">
              • Updated {moment(insight.captured_at).fromNow()}
            </Text>
          </Space>
        </>
      )}
    </Modal>
  );
};

export default PostDetailsModal;
