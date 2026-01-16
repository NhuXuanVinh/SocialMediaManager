// components/EditPostModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Input,
  Button,
  DatePicker,
  Tag,
  Checkbox,
  message,
  Space,
  Upload,
  Row,
  Col,
  Avatar,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  PictureOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from '../utils/dayjs';
import axiosClient from '../apis/axiosClient';
import { getTags } from '../apis/tagAPI';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import PostPreviewPanel from './Previews/PostPreviewPanel';

const EditPostModal = ({ post, onClose, onSuccess }) => {
  const workspaceId = localStorage.getItem('workspaceId');

  const [content, setContent] = useState(post.content || '');

  // ✅ allow changing time for draft/pending/scheduled
  const [scheduledAt, setScheduledAt] = useState(
    post.scheduledAt ? dayjs(post.scheduledAt) : null
  );

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(post.tags || []);
  const [tagSearch, setTagSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ Upload fileList (AntD)
  const [imageList, setImageList] = useState(() => {
    const media = post.PostMedia || [];
    return media.map((m) => ({
      uid: String(m.media_id || m.public_id || m.url),
      name: m.public_id || 'image',
      status: 'done',
      url: m.url,
      cloudinary: {
        url: m.url,
        publicId: m.public_id,
        width: m.width,
        height: m.height,
        format: m.format,
      },
    }));
  });

  const canEditTime = ['draft', 'pending', 'scheduled'].includes(post.status);

  /* -----------------------------
     Load tags
  ------------------------------ */
  useEffect(() => {
    if (!workspaceId) return;

    getTags({ workspaceId, limit: 100 })
      .then((res) => setAvailableTags(res.data.data || []))
      .catch(() => message.error('Failed to load tags'));
  }, [workspaceId]);

  /* -----------------------------
     Helpers: Platform display
  ------------------------------ */
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

  /* -----------------------------
     Upload logic (same as NewPostModal)
  ------------------------------ */
  const handleImageChange = async ({ fileList }) => {
    const newFileList = [...fileList];
    setImageList(newFileList);

    for (let i = 0; i < newFileList.length; i++) {
      const file = newFileList[i];

      // Skip already uploaded
      if (file.url || file.status === 'done') continue;
      if (!file.originFileObj) continue;

      try {
        newFileList[i] = { ...file, status: 'uploading' };
        setImageList([...newFileList]);

        const uploaded = await uploadToCloudinary(file.originFileObj);

        newFileList[i] = {
          ...file,
          status: 'done',
          url: uploaded.url,
          cloudinary: uploaded,
        };

        setImageList([...newFileList]);
      } catch (err) {
        console.error('Cloudinary upload error:', err);

        newFileList[i] = { ...file, status: 'error' };
        setImageList([...newFileList]);

        message.error(`Failed to upload ${file.name}`);
      }
    }
  };

  /* -----------------------------
     Tag dropdown logic (same style)
  ------------------------------ */
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.tag_id === tag.tag_id)
        ? prev.filter((t) => t.tag_id !== tag.tag_id)
        : [...prev, tag]
    );
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const tagDropdownOverlay = (
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
          <span style={{ fontSize: 12, color: '#999' }}>
            No tags found.
          </span>
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
              checked={selectedTags.some((t) => t.tag_id === tag.tag_id)}
              onChange={() => handleTagToggle(tag)}
            />
            <Tag color={tag.color || 'default'}>#{tag.name}</Tag>
          </label>
        ))}
      </div>
    </div>
  );

  /* -----------------------------
     Save changes
  ------------------------------ */
  const handleSave = async () => {
    try {
      setSaving(true);

      const stillUploading = imageList.some((f) => f.status === 'uploading');
      if (stillUploading) {
        message.warning('Please wait for image uploads to finish');
        return;
      }

      const media = imageList
        .filter((f) => f.cloudinary)
        .map((f) => f.cloudinary);

      if (media.length > 10) {
        message.error('Maximum 10 images allowed');
        return;
      }

      await axiosClient.put(`/post/${post.post_id}`, {
        workspaceId,
        text: content,
        scheduledAt: canEditTime ? scheduledAt?.toISOString() || null : null,
        tagIds: selectedTags.map((t) => t.tag_id),
        media,
      });

      message.success('Post updated');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      message.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Edit Post"
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={1100}
      style={{ top: 40 }}
      bodyStyle={{
        maxHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Row gutter={24} align="top" style={{ flex: 1, minHeight: 0 }}>
        {/* LEFT COLUMN */}
        <Col
          span={16}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {/* Top controls (like NewPostModal): only tag dropdown */}
          <div
            style={{
              marginBottom: 16,
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Space>
              <Avatar icon={getPlatformIcon(post.platform)} />
              <div>
                <strong>{post.accountName}</strong>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {post.platform}
                </div>
              </div>
              <Tag color="blue">{post.status}</Tag>
            </Space>

            {/* ✅ Tag dropdown */}
            <Dropdown
              overlay={tagDropdownOverlay}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip
                title={
                  selectedTags.length
                    ? `Tags: ${selectedTags.map((t) => t.name).join(', ')}`
                    : 'Add tags'
                }
              >
                <Button
                  size="small"
                  shape="circle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  #
                </Button>
              </Tooltip>
            </Dropdown>
          </div>

          {/* Composer */}
          <div style={{ marginBottom: 16 }}>
            <h4>Post</h4>
            <Input.TextArea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edit your post content..."
              style={{ minHeight: 120 }}
            />
          </div>

          {/* Upload images */}
          <div style={{ marginBottom: 16 }}>
            <h4>Images</h4>
            <Upload
              accept="image/*"
              listType="picture-card"
              onChange={handleImageChange}
              beforeUpload={() => false}
              multiple
              fileList={imageList}
            >
              <Button icon={<PictureOutlined />} type="text" />
            </Upload>
          </div>

          {/* Scheduled time */}
          {canEditTime && (
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <h4>Post Time</h4>
              <DatePicker
                showTime
                value={scheduledAt}
                onChange={setScheduledAt}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                placeholder="Select date & time (optional)"
              />
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                {post.status === 'scheduled'
                  ? 'Changing this will reschedule the post.'
                  : 'Optional. Saving a time keeps it in database.'}
              </div>
            </div>
          )}
        </Col>

        {/* RIGHT COLUMN: preview */}
        <Col
          span={8}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <h4>Preview</h4>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PostPreviewPanel
              selectedAccounts={[
                {
                  account_id: post.account_id,
                  account_name: post.accountName,
                  platform: post.platform,
                },
              ]}
              postContent={content}
              imageList={imageList}
              postOption={post.status === 'scheduled' ? 'schedule' : 'draft'}
              scheduledDate={scheduledAt ? scheduledAt.toISOString() : null}
            />
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button type="primary" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default EditPostModal;
