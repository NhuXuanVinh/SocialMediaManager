// components/PostsListView.jsx
import React, { useMemo, useState, useRef } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Segmented,
  Image,
  message,
  Popconfirm,
  Dropdown,
  Input,
  Checkbox,
  Tooltip,
} from 'antd';
import moment from 'moment';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  EditOutlined,
  SendOutlined,
  DeleteOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import EditPostModal from './EditPostModal';
import { transitionPost, deletePost, updatePostTags } from '../apis/postAPI';
import { getTags } from '../apis/tagAPI';

/* ----------------------------------------
   Helpers
---------------------------------------- */

const formatNumber = (n) =>
  n == null ? '-' : Intl.NumberFormat().format(n);


const getPlatformIcon = (platform = '') => {
  switch ((platform || '').toLowerCase()) {
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
  if (status === 'draft') return 'gray';
  if (status === 'pending') return 'orange';
  if (status === 'failed') return 'red';
  return 'default';
};

const normalizeStatus = (status = '') => {
  if (status === 'posted') return 'sent';
  if (status === 'scheduled') return 'scheduled';
  if (status === 'draft') return 'draft';
  if (status === 'pending') return 'pending';
  return 'other';
};

/* ----------------------------------------
   Component
---------------------------------------- */

const PostsListView = ({ posts = [], userRole, onRefresh, workspaceId }) => {
  const [filter, setFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);

  // ✅ tags dropdown state
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');

  // per-post loading for tag updates
  const [tagLoading, setTagLoading] = useState({}); // { [postId]: true/false }
  const lastReqRef = useRef({}); // prevent race conditions

  const isPublisher = ['publisher', 'admin', 'owner'].includes(userRole);

  /* -----------------------------
     Transition publish/request
  ------------------------------ */
  const handleTransition = async (postId) => {
    try {
      await transitionPost(postId, workspaceId);
      message.success('Post updated successfully');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update post';
      message.error(msg);
    }
  };

  /* -----------------------------
     Delete post
  ------------------------------ */
  const handleDelete = async (postId) => {
    try {
      await deletePost(postId, workspaceId);
      message.success('Post deleted');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete post';
      message.error(msg);
    }
  };

  /* -----------------------------
     Lazy load tags list
  ------------------------------ */
  const ensureTagsLoaded = async () => {
    if (availableTags.length > 0) return;

    try {
      const res = await getTags({ workspaceId, limit: 100 });
      setAvailableTags(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to load tags');
    }
  };

  /* -----------------------------
     Instant tag update (toggle + API)
  ------------------------------ */
  const handleToggleTag = async (post, tag) => {
    const postId = post.post_id;

    const current = post.tags || [];
    const exists = current.some((t) => t.tag_id === tag.tag_id);

    const nextTags = exists
      ? current.filter((t) => t.tag_id !== tag.tag_id)
      : [...current, tag];

    const nextIds = nextTags.map((t) => t.tag_id);

    // avoid race: keep latest request per post
    const requestId = Date.now();
    lastReqRef.current[postId] = requestId;

    try {
      setTagLoading((p) => ({ ...p, [postId]: true }));
      await updatePostTags(postId, workspaceId, nextIds);

      // ignore stale response
      if (lastReqRef.current[postId] !== requestId) return;

      message.success('Tags updated');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      message.error('Failed to update tags');
    } finally {
      if (lastReqRef.current[postId] === requestId) {
        setTagLoading((p) => ({ ...p, [postId]: false }));
      }
    }
  };

  /* -----------------------------
     Dropdown overlay UI
  ------------------------------ */
  const renderTagDropdown = (post) => {
    const filteredTags = availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    return (
      <div
        style={{
          padding: 10,
          width: 260,
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
          border: '1px solid #e4e6eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          size="small"
          placeholder="Search tags"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          style={{ marginBottom: 8 }}
          allowClear
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {filteredTags.length === 0 && (
            <span style={{ fontSize: 12, color: '#999' }}>No tags found.</span>
          )}

          {filteredTags.map((tag) => (
            <label
              key={tag.tag_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                cursor: 'pointer',
              }}
            >
              <Checkbox
                checked={(post.tags || []).some((t) => t.tag_id === tag.tag_id)}
                disabled={!!tagLoading[post.post_id]}
                onChange={() => handleToggleTag(post, tag)}
              />
              <Tag color={tag.color || 'default'}>#{tag.name}</Tag>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /* -----------------------------
     Filter posts
  ------------------------------ */
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (filter === 'all') {
      list = list.filter((p) => ['posted', 'scheduled'].includes(p.status));
    } else {
      list = list.filter((p) => normalizeStatus(p.status) === filter);
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts, filter]);

  return (
    <>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Sent', value: 'sent' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Pending', value: 'pending' },
          { label: 'Drafts', value: 'draft' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <List
        itemLayout="vertical"
        dataSource={filteredPosts}
        locale={{ emptyText: 'No posts found' }}
        renderItem={(post) => {
          const latestInsight = post.PostInsights?.[0];
          const showInsights = post.status === 'posted' && latestInsight;
          const canTransition =
            (userRole === 'editor' && post.status === 'draft') ||
            (isPublisher && ['draft', 'pending'].includes(post.status));

          const canEdit =
            post.status === 'draft' ||
            post.status === 'pending' ||
            (post.status === 'scheduled' && isPublisher);

          const showDate =
            post.status === 'scheduled' ||
            post.status === 'posted' ||
            ((post.status === 'pending' || post.status === 'draft') &&
              post.scheduledAt);

          // ✅ delete permission rules:
          // - publisher/admin/owner: draft + pending + scheduled
          // - editor: draft + pending
          const canDelete =
            (isPublisher &&
              ['draft', 'pending', 'scheduled'].includes(post.status)) ||
            (userRole === 'editor' &&
              ['draft', 'pending'].includes(post.status));

          return (
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
                    <Tag color={getStatusColor(post.status)}>{post.status}</Tag>
                    {showDate && post.date && (
                      <span style={{ fontSize: 12 }}>
                        {moment(post.date).format('MMM D • HH:mm')}
                      </span>
                    )}
                  </Space>
                </Space>

                {/* Body */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginTop: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* LEFT */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* ✅ Tags row (click tag to remove) + dropdown */}
                    <Space wrap style={{ marginBottom: 8 }}>
                      

                      {/* Add/remove tag dropdown */}
                      <Dropdown
                        overlay={renderTagDropdown(post)}
                        trigger={['click']}
                        placement="bottomLeft"
                        onOpenChange={(open) => {
                          if (open) {
                            ensureTagsLoaded();
                            setTagSearch('');
                          }
                        }}
                      >
                        <Tooltip title="Add/remove tags">
                          <Button
                            size="small"
                            shape="circle"
                            loading={!!tagLoading[post.post_id]}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              marginRight: 10,
                            }}
                          >
                            #
                          </Button>
                        </Tooltip>
                      </Dropdown>
                    </Space>

                    {(post.tags || []).map((t) => (
                        <Tag
                          key={t.tag_id}
                          color={t.color}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleTag(post, t)}
                        >
                          {t.name}
                        </Tag>
                      ))}

                    {/* Content */}
                    <div style={{ marginBottom: 12,  whiteSpace: 'pre-wrap',
    wordBreak: 'break-word', }}>
                      {post.content || <i>No content</i>}
                    </div>
                    {/* 📊 Insights */}
{showInsights && (
  <Space
    size={14}
    style={{
      fontSize: 12,
      color: '#666',
      marginBottom: 12,
    }}
  >
    <span>
      <EyeOutlined style={{ marginRight: 4 }} />
      {formatNumber(latestInsight.impressions)}
    </span>

    <span>
      <LikeOutlined style={{ marginRight: 4 }} />
      {formatNumber(latestInsight.likes)}
    </span>

    <span>
      <MessageOutlined style={{ marginRight: 4 }} />
      {formatNumber(latestInsight.comments)}
    </span>

    <span>
      <ShareAltOutlined style={{ marginRight: 4 }} />
      {formatNumber(latestInsight.shares)}
    </span>

    <span style={{ opacity: 0.6 }}>
      • {moment(latestInsight.captured_at).fromNow()}
    </span>
  </Space>
)}


                    {/* Footer */}
                    <Space
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      {/* LEFT actions */}
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

                        {(post.status === 'draft' ||
                          post.status === 'scheduled' ||
                          post.status === 'pending') &&
                          canEdit && (
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => setEditingPost(post)}
                            >
                              Edit
                            </Button>
                          )}

                        {canTransition && (
                          <Button
                            type="primary"
                            icon={
                              <SendOutlined style={{ transform: 'scaleX(-1)' }} />
                            }
                            onClick={() => handleTransition(post.post_id)}
                          >
                            {userRole === 'editor'
                              ? 'Request approval'
                              : 'Publish'}
                          </Button>
                        )}
                      </Space>

                      {/* RIGHT action */}
                      {canDelete && (
                        <Popconfirm
                          title="Delete this post?"
                          description="This action cannot be undone."
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                          cancelText="Cancel"
                          onConfirm={() => handleDelete(post.post_id)}
                        >
                          <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
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
          );
        }}
      />

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => onRefresh?.()}
        />
      )}
    </>
  );
};

export default PostsListView;
