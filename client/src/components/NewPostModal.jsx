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
import { createPost } from '../apis/postAPI';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const { CheckableTag } = Tag;

// mock initial tags – later you can fetch from your Tag Management page

const NewPostModal = ({ onClose, onSuccess, userRole, isVisible, accounts = [] }) => {

    const isPublisher =
  userRole === 'publisher' ||
  userRole === 'admin' ||
  userRole === 'owner';
  const workspaceId = localStorage.getItem('workspaceId');

  // form states
  const [postContent, setPostContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [postOption, setPostOption] = useState(
  isPublisher ? 'post' : 'draft'
);
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
      const res = await getTags({workspaceId, limit: 100 });
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

const handleImageChange = async ({ fileList }) => {
  // clone list to avoid mutation
  const newFileList = [...fileList];
  setImageList(newFileList);

  for (let i = 0; i < newFileList.length; i++) {
    const file = newFileList[i];

    // Skip already uploaded
    if (file.url || file.status === 'done') continue;
    if (!file.originFileObj) continue;

    try {
      // mark uploading
      newFileList[i] = {
        ...file,
        status: 'uploading',
      };
      setImageList([...newFileList]);

      const uploaded = await uploadToCloudinary(file.originFileObj);

      newFileList[i] = {
        ...file,
        status: 'done',
        url: uploaded.url,           // 🔑 required by AntD
        cloudinary: uploaded,        // your metadata
      };

      setImageList([...newFileList]);
    } catch (err) {
      console.error('Cloudinary upload error:', err);

      newFileList[i] = {
        ...file,
        status: 'error',
      };

      setImageList([...newFileList]);
      message.error(`Failed to upload ${file.name}`);
    }
  }
};



  const handleSubmitPost = async () => {
    if (selectedAccounts.length === 0) {
      message.error('Please select at least one account to post to.');
      return;
    }

    if (postOption === 'schedule' && isPublisher && !scheduledDate) {
  message.error('Please select a date and time');
  return;
}
  let finalPostType = postOption;

// editor requesting approval
      if (!isPublisher && postOption === 'request') {
        finalPostType = 'request'; // backend maps this to "pending"
      }



    try {
      const formData = new FormData();
      const workspaceId = localStorage.getItem('workspaceId');
      formData.append('workspaceId', workspaceId);
      formData.append('text', postContent);
      formData.append('postType', finalPostType);
      formData.append('accounts', JSON.stringify(selectedAccounts));
      if (scheduledDate) formData.append('scheduledTime', scheduledDate);
      if (note) formData.append('note', note);
if (selectedTags.length > 0) {
  const tagIds = selectedTags.map(t => t.tag_id);
  formData.append('tagIds', JSON.stringify(tagIds));
}

      const uploadedMedia = imageList
  .filter(f => f.cloudinary)
  .map(f => f.cloudinary);

formData.append('media', JSON.stringify(uploadedMedia));

      await createPost(formData);

      
    message.success(
      postOption === 'draft'
        ? 'Draft saved'
        : postOption === 'schedule'
        ? 'Post scheduled'
        : 'Post published'
    );
    onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error posting:', error);
      message.error('Failed to post. Please try again.');
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
      if (e.key !== 'schedule' && e.key !== 'request') {
        setScheduledDate(null);
      }
    }}
  >
    <Menu.Item key="draft">Save as Draft</Menu.Item>

    {!isPublisher && (
      <Menu.Item key="request">Request Approval</Menu.Item>
    )}

    {isPublisher && (
      <>
        <Menu.Item key="post">Post Now</Menu.Item>
        <Menu.Item key="schedule">Schedule Post</Menu.Item>
      </>
    )}
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

  const primaryLabel = !isPublisher
  ? postOption === 'request'
    ? 'Request Approval'
    : 'Save as Draft'
  : postOption === 'schedule'
  ? 'Schedule Post'
  : postOption === 'draft'
  ? 'Save as Draft'
  : 'Post Now';

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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >

            <Dropdown
              overlay={tagDropdownOverlay}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip
                title={
                  selectedTags.length
                    ? `Tags: ${selectedTags.map(t => t.name).join(', ')}`
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
  onClick={handleSubmitPost}
>
  {primaryLabel}
</Dropdown.Button>
                  {(postOption === 'schedule' || postOption === 'request' || postOption === 'draft') && (
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
