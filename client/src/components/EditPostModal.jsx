// components/EditPostModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Input,
  Button,
  DatePicker,
  Tag,
  Checkbox,
  message,
  Space,
} from 'antd';
import dayjs from '../utils/dayjs';
import axios from 'axios';
import { getTags } from '../apis/tagAPI';

const EditPostModal = ({ post, onClose }) => {
  const [content, setContent] = useState(post.content || '');
  const [scheduledAt, setScheduledAt] = useState(
    post.scheduledAt ? dayjs(post.scheduledAt) : null
  );
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(post.tags || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTags({ limit: 100 }).then((res) => {
      setAvailableTags(res.data.data || []);
    });
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.tag_id === tag.tag_id)
        ? prev.filter((t) => t.tag_id !== tag.tag_id)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await axios.put(
        `http://localhost:5000/api/post/${post.post_id}`,
        {
          text: content,
          scheduledAt:
            post.status === 'scheduled'
              ? scheduledAt?.toISOString()
              : null,
          tagIds: selectedTags.map((t) => t.tag_id),
        }
      );

      message.success('Post updated');
      onClose();
    } catch (err) {
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
      width={700}
    >
      {/* Platform (read-only) */}
      <Space style={{ marginBottom: 16 }}>
        <strong>{post.accountName}</strong>
        <Tag>{post.platform}</Tag>
        <Tag color="blue">{post.status}</Tag>
      </Space>

      {/* Content */}
      <Input.TextArea
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit post content"
      />

      {/* Scheduled time */}
      {post.status === 'scheduled' && (
        <div style={{ marginTop: 16 }}>
          <strong>Scheduled Time</strong>
          <DatePicker
            showTime
            style={{ width: '100%', marginTop: 8 }}
            value={scheduledAt}
            onChange={setScheduledAt}
            format="YYYY-MM-DD HH:mm"
          />
        </div>
      )}

      {/* Tags */}
      <div style={{ marginTop: 16 }}>
        <strong>Tags</strong>
        <div style={{ marginTop: 8 }}>
          {availableTags.map((tag) => (
            <Checkbox
              key={tag.tag_id}
              checked={selectedTags.some((t) => t.tag_id === tag.tag_id)}
              onChange={() => toggleTag(tag)}
              style={{ marginRight: 12 }}
            >
              <Tag color={tag.color}>{tag.name}</Tag>
            </Checkbox>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={saving}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default EditPostModal;
