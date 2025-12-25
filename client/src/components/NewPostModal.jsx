// components/NewPostModal.jsx
import React, { useState, useRef } from 'react';
import {
  Modal,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Avatar,
  DatePicker,
  Dropdown,
  Menu,
  Tooltip,
  Tag,
  Checkbox,           // 👈 added
} from 'antd';
import {
  SmileOutlined,
  PictureOutlined,
  DownOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import moment from 'moment';
import dayjs from '../utils/dayjs';
import axios from 'axios';
import PostPreviewPanel from './Previews/PostPreviewPanel';
import { getTags } from '../apis/tagAPI';
import { useEffect } from 'react';

const { CheckableTag } = Tag;

// mock initial tags – later you can fetch from your Tag Management page

const NewPostModal = ({ onClose, isVisible, accounts = [] }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [postOption, setPostOption] = useState('now');
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
const [availableTags, setAvailableTags] = useState([]);
// each tag = { tag_id, name, color }

  // 🔹 tags state      // fixed list for now
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');

  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
  if (!isVisible) return;

  const fetchTags = async () => {
    try {
      const res = await getTags({ limit: 100 });
      setAvailableTags(res.data.data || []);
    } catch (err) {
      message.error('Failed to load tags');
    }
  };

  fetchTags();
}, [isVisible]);

  const handlePostContentChange = (e) => setPostContent(e.target.value);

  const handleEmojiClick = (emojiObject) => {
    setPostContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageChange = (info) => {
    const newList = info.fileList.map((file) => ({ ...file }));
    setImageList(newList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const handleSubmitPost = async () => {
    if (selectedAccounts.length === 0) {
      message.error('Please select at least one account to post to.');
      return;
    }

    if (postOption === 'schedule' && !scheduledDate) {
      message.error('Please select a date and time to schedule the post.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('text', postContent);
      formData.append('postType', postOption);
      formData.append('accounts', JSON.stringify(selectedAccounts));
      if (scheduledDate) formData.append('scheduledTime', scheduledDate);
      if (note) formData.append('note', note);
if (selectedTags.length > 0) {
  const tagIds = selectedTags.map(t => t.tag_id);
  formData.append('tagIds', JSON.stringify(tagIds));
}

      imageList.forEach((file) => {
        if (file.originFileObj) formData.append('media', file.originFileObj);
      });

      await axios.post(`http://localhost:5000/api/post`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      
    message.success(
      postOption === 'draft'
        ? 'Draft saved'
        : postOption === 'schedule'
        ? 'Post scheduled'
        : 'Post published'
    );
      onClose();
    } catch (error) {
      console.error('Error posting:', error);
      message.error('Failed to post. Please try again.');
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === 'now') {
      setPostOption('now');
      setScheduledDate(null);
    } else if (e.key === 'schedule') {
      setPostOption('schedule');
    } else if (e.key === 'draft') {
      setPostOption('draft');
    }
  };

  const handleAccountChange = (account) => {
    setSelectedAccounts((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (selected) => selected.account_id === account.account_id
      );
      if (isAlreadySelected) {
        return prevSelected.filter(
          (selected) => selected.account_id !== account.account_id
        );
      }
      return [...prevSelected, account];
    });
  };

  const handleDateChange = (date) =>
    setScheduledDate(date ? date.toISOString() : null);

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

  // tag helpers
const handleTagToggle = (tag) => {
  setSelectedTags((prev) =>
    prev.some((t) => t.tag_id === tag.tag_id)
      ? prev.filter((t) => t.tag_id !== tag.tag_id)
      : [...prev, tag]
  );
};



  const postActionMenu = (
    <Menu
      onClick={(e) => {
        setPostOption(e.key);
        if (e.key !== 'schedule') {
        setScheduledDate(null);
      }
      }}
    >
      <Menu.Item key="post">Post Now</Menu.Item>
      <Menu.Item key="draft">Save as Draft</Menu.Item>
      <Menu.Item key="schedule">Schedule Post</Menu.Item>
    </Menu>
  );

  // 🔍 filter tags for dropdown
const filteredTags = availableTags.filter((tag) =>
  tag.name.toLowerCase().includes(tagSearch.toLowerCase())
);


  // Tag dropdown overlay panel
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

  return (
    <Modal
      title="Create Post"
      open={isVisible}
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
      <Row
        gutter={24}
        align="top"
        style={{ flex: 1, minHeight: 0 }}
      >
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
          {/* Top controls: Note + Tag dropdown */}
          <div
            style={{
              marginBottom: 16,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#f7f9fc',
              border: '1px solid #eaecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Tooltip title={note || 'No note'} placement="left">
              <Button
                type={note ? 'primary' : 'default'}
                icon={<FileTextOutlined />}
                onClick={() => setShowNoteInput((prev) => !prev)}
                size="small"
              >
                Add Note
              </Button>
            </Tooltip>

            <Dropdown
              overlay={tagDropdownOverlay}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip
                title={
                  selectedTags.length
                    ? `Tags: ${selectedTags.map(t => t.name).join(', ')}`
                    : 'Add / search tags'
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

          {showNoteInput && (
            <div style={{ marginBottom: 16 }}>
              <Input.TextArea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a note"
              />
            </div>
          )}

          {/* Account selection as horizontal chips */}
          <div
            style={{
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #eee',
            }}
          >
            <h4>Select Accounts</h4>

            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 6,
                scrollbarWidth: 'thin',
              }}
            >
              {accounts.map((account) => {
                const selected = selectedAccounts.some(
                  (a) => a.account_id === account.account_id
                );
                const platformColor = getPlatformColor(account.platform);

                return (
                  <CheckableTag
                    key={account.account_id}
                    checked={selected}
                    onChange={() => handleAccountChange(account)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 999,
                      padding: '4px 10px',
                      border: `1px solid ${
                        selected ? platformColor : 'rgba(0,0,0,0.15)'
                      }`,
                      backgroundColor: selected ? `${platformColor}11` : '#fff',
                      color: selected ? '#111' : '#444',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: selected
                        ? '0 0 0 1px rgba(0,0,0,0.02)'
                        : 'none',
                      transition: 'all 0.15s ease-out',
                    }}
                  >
                    <Avatar
                      size="small"
                      icon={getPlatformIcon(account.platform)}
                      style={{
                        marginRight: 6,
                        backgroundColor: '#fff',
                        border: `1px solid ${platformColor}`,
                      }}
                    />
                    <span style={{ fontWeight: selected ? 600 : 400 }}>
                      {account.account_name}
                    </span>
                  </CheckableTag>
                );
              })}
            </div>
          </div>

          {/* Composer */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h4>Post</h4>
            <div style={{ position: 'relative' }}>
              <Input.TextArea
                rows={6}
                value={postContent}
                onChange={handlePostContentChange}
                placeholder="Write your post here..."
                style={{ paddingRight: '30px', minHeight: '120px' }}
              />
              <SmileOutlined
                ref={emojiButtonRef}
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              />
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '10px',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    background: '#fff',
                    padding: '10px',
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col>
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
              </Col>
            </Row>



            {/* <div style={{ marginTop: 20, marginBottom: 8 }}>
              <Dropdown overlay={scheduleMenu} trigger={['click']}>
                <Button>
                  {postOption === 'now' ? 'Post Now' : 'Schedule Post'}{' '}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div> */}
          </div>
        </Col>

        {/* RIGHT COLUMN: preview panel */}
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
              selectedAccounts={selectedAccounts}
              postContent={postContent}
              imageList={imageList}
              postOption={postOption}
              scheduledDate={scheduledDate}
            />
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Dropdown.Button
          type="primary"
          overlay={postActionMenu}
          icon={<DownOutlined />}
          onClick={() => handleSubmitPost(postOption)}
        >
          {postOption === 'draft'
    ? 'Save as Draft'
    : postOption === 'schedule'
    ? 'Schedule Post'
    : 'Post Now'}
        </Dropdown.Button>
                  {postOption === 'schedule' && (
              <div style={{ marginTop: 20,  textAlign: 'left' }}>
                <h4 >Select a Date</h4>
                <DatePicker
                  showTime
                  value={scheduledDate ? dayjs(scheduledDate) : null}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </div>
            )}
      </div>
    </Modal>
  );
};

export default NewPostModal;
