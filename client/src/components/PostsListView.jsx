// components/PostsListView.jsx
import React, { useMemo, useState } from 'react';
import { Card, List, Tag, Button, Space, Segmented, Image } from 'antd';
import moment from 'moment';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  EditOutlined,
} from '@ant-design/icons';
import EditPostModal from './EditPostModal';

/* ----------------------------------------
   Helpers
---------------------------------------- */

const getPlatformIcon = (platform = '') => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <FacebookOutlined style={{ color: '#1877F2' }} />;
    case 'twitter':
      return <TwitterOutlined style={{ color: '#1DA1F2' }} />;
    case 'instagram':
      return <InstagramOutlined style={{ color: '#E1306C' }} />;
    case 'linkedin':
      return <LinkedinOutlined style={{ color: '#0077B5' }} />;
    default:
      return null;
  }
};

const getStatusColor = (status = '') => {
  if (status === 'scheduled') return 'blue';
  if (status === 'posted') return 'green';
  if (status === 'draft') return 'gold';
  if (status === 'failed') return 'red';
  return 'default';
};

const normalizeStatus = (status = '') => {
  if (status === 'posted') return 'sent';
  if (status === 'scheduled') return 'scheduled';
  if (status === 'draft') return 'draft';
  return 'other';
};

/* ----------------------------------------
   Component
---------------------------------------- */

const PostsListView = ({ posts = [] }) => {
  const [filter, setFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (filter === 'all') {
      list = list.filter((p) =>
        ['posted', 'scheduled'].includes(p.status)
      );
    } else {
      list = list.filter(
        (p) => normalizeStatus(p.status) === filter
      );
    }

    return list.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [posts, filter]);

  return (
    <>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Sent', value: 'sent' },
          { label: 'Drafts', value: 'draft' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <List
        itemLayout="vertical"
        dataSource={filteredPosts}
        locale={{ emptyText: 'No posts found' }}
        renderItem={(post) => (
          <List.Item>
<Card>
  {/* Header */}
  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    <Space>
      {getPlatformIcon(post.platform)}
      <div>
        <strong>{post.accountName || 'Draft'}</strong>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {post.platform || 'Draft'}
        </div>
      </div>
    </Space>

    <Space>
      <Tag color={getStatusColor(post.status)}>
        {post.status}
      </Tag>
      {post.date && (
        <span style={{ fontSize: 12 }}>
          {moment(post.date).format('MMM D • HH:mm')}
        </span>
      )}
    </Space>
  </Space>

  {/* Body: content left / media right */}
  <div
    style={{
      display: 'flex',
      gap: 16,
      marginTop: 12,
      alignItems: 'flex-start',
    }}
  >
    {/* LEFT: text */}
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Tags */}
      {post.tags?.length > 0 && (
        <Space wrap style={{ marginBottom: 8 }}>
          {post.tags.map((t) => (
            <Tag key={t.tag_id} color={t.color}>
              {t.name}
            </Tag>
          ))}
        </Space>
      )}

      {/* Content */}
      <div style={{ marginBottom: 12 }}>
        {post.content || <i>No content</i>}
      </div>

      {/* Footer */}
      <Space>
        {post.postLink && (
          <Button
            type="link"
            href={post.postLink}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            View Post
          </Button>
        )}

        {(post.status === 'draft' || post.status === 'scheduled') && (
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditingPost(post)}
          >
            Edit
          </Button>
        )}
      </Space>
    </div>

    {/* RIGHT: media */}
    {post.PostMedia?.length > 0 && (
      <div style={{ width: 220 }}>
        <Image.PreviewGroup>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                post.PostMedia.length === 1
                  ? '1fr'
                  : 'repeat(2, 1fr)',
              gap: 6,
            }}
          >
            {post.PostMedia.slice(0, 4).map((media) => (
              <Image
                key={media.media_id}
                src={media.url}
                style={{
                  width: '100%',
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 6,
                }}
                preview
              />
            ))}
          </div>
        </Image.PreviewGroup>
      </div>
    )}
  </div>
</Card>

          </List.Item>
        )}
      />

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}
    </>
  );
};

export default PostsListView;
