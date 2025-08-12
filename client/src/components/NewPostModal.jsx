import React, { useState, useRef, useEffect } from 'react';
import { Modal, Input, Button, Upload, message, Row, Col, Checkbox, Avatar, DatePicker, Dropdown, Menu } from 'antd';
import { SmileOutlined, PictureOutlined, DownOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import moment from 'moment';
import axios from 'axios';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Option } = Checkbox;

const NewPostModal = ({onClose, isVisible, accounts = [] }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(null); // New state for scheduled date
  const [postOption, setPostOption] = useState('now'); // Track if user chose to post now or schedul
  const emojiButtonRef = useRef(null);  // Reference to the emoji button for positioning
  const emojiPickerRef = useRef(null);  // Reference to the emoji picker

  // Handle text input change
  const handlePostContentChange = (e) => {
    setPostContent(e.target.value);
  };

  // Handle emoji click to insert emoji into text
  const handleEmojiClick = (emojiObject) => {
    setPostContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);  // Hide emoji picker after selection
  };

  // Handle image selection
  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
    setImageList(info.fileList);
  };


  // Handle modal submission (Post Now or Schedule Post)
  const handleSubmitPost = async () => {
    if (selectedAccounts.length === 0) {
      message.error("Please select at least one account to post to.");
      return;
    }

    if (postOption === 'schedule' && !scheduledDate) {
      message.error("Please select a date and time to schedule the post.");
      return;
    }
    try {
      const formData = new FormData()
      formData.append('text', postContent);
    formData.append('postType', postOption); // 'now' or 'schedule'
    formData.append('accounts', JSON.stringify(selectedAccounts)); // Convert accounts array to JSON string
    if (scheduledDate) {
      formData.append('scheduledTime', scheduledDate);
    }

    // Step 3: Append files to the FormData
    imageList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('media', file.originFileObj); // Add each file with the key 'media'
      }
    });
      const data = {  
        text: postContent,
        accounts: selectedAccounts,
        postType: postOption,
        scheduledTime: scheduledDate
      };
      
      // Send the data to the backend via the POST request
      const response = await axios.post(`http://localhost:5000/api/post`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data', // Specify the correct content type
        },
      });
      message.success("Post successfully")
    } catch (error) {
      console.error('Error posting tweet:', error);
      message.error("Failed to post. Please try again.");
    }

    
    onClose();
  };

  // Handle menu item click (Post Now or Schedule Post)
  const handleMenuClick = (e) => {
    if (e.key === 'now') {
      setPostOption('now');
      setScheduledDate(null); // Clear the scheduled date if "Post Now" is chosen
    } else if (e.key === 'schedule') {
      setPostOption('schedule');
    }
  };

  // Handle account selection change
  const handleAccountChange = (account) => {
    setSelectedAccounts((prevSelected) => {
      const isAlreadySelected = prevSelected.some((selected) => selected.account_id === account.account_id);
  
      if (isAlreadySelected) {
        // Deselect the account if it's already selected
        return prevSelected.filter((selected) => selected.account_id !== account.account_id);
      } else {
        // Add the account to the selected list if not selected
        return [...prevSelected, account];
      }
    });
  };
  
  useEffect(() => {
    console.log('Updated Selected Accounts:', selectedAccounts);
  }, [selectedAccounts]);
  // Handle date selection for scheduling
  const handleDateChange = (date, dateString) => {
    if (date) {
      setScheduledDate(date.toISOString()); // Store the selected date in ISO format
    } else {
      setScheduledDate(null); // Clear the date if the user removes the selection
    }
  };

  
  const getPlatformIcon = (platform) => {
    if (!platform) {
      // Return a default icon if platform is undefined or null
      return <UserOutlined />;
    }
  
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <FacebookOutlined style={{color: 'black'}}/>;
      case 'twitter':
        return <TwitterOutlined style={{color: 'black'}} />;
      case 'instagram':
        return <InstagramOutlined style={{color: 'black'}} />;
      case 'linkedin':
        return <LinkedinOutlined style={{color: 'black'}} />;
      default:
        return <UserOutlined style={{color: 'black'}} />;
    }
  };
  // Dropdown menu for "Post Now" and "Schedule Post" options
  //
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="now">
        Post Now
      </Menu.Item>
      <Menu.Item key="schedule">
        Schedule Post
      </Menu.Item>
    </Menu>
  );

  return (
    <Modal
      title="Create a New Post"
      open={isVisible}
      onCancel={onClose}
      onOk={handleSubmitPost}
      okText="Post"
      cancelText="Cancel"
      destroyOnClose
      width={900}  // Set modal width to 900px for a wider modal
      style={{ top: 100 }}  // Adjust top margin to position the modal lower on the screen
    >
      <div>
        {/* Account Selection with Icons */}
        <div style={{ marginBottom: 20 }}>
          <h4>Select Accounts</h4>
          <Checkbox.Group
            value={selectedAccounts}
            onChange={handleAccountChange}
            style={{ display: 'flex', flexWrap: 'wrap' }}
          >
            {accounts.map((account) => (
              <Col span={6} key={account.account_id} style={{ marginBottom: 10 }}>
                <Checkbox value={account.account_id} style={{ display: 'none' }}> {/* Hide the default checkbox */}
                  <Avatar
                    src={getPlatformIcon(account.flatform)} // Use a placeholder if no icon is provided
                    style={{
                      marginRight: 10,
                      opacity: selectedAccounts.includes(account) ? 1 : 0.5,  // Gray out unselected accounts
                    }}
                  />
                  {account.account_name}
                </Checkbox>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    backgroundColor: selectedAccounts.includes(account) ? '#f0f0f0' : '#fff',  // Highlight selected account
					          opacity: selectedAccounts.includes(account) ? 1 : 0.5,  // Grey out unselected accounts
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() => handleAccountChange(account)}  // Toggle account selection
                >
                  <Avatar
                    src={getPlatformIcon(account.platform)}
                    style={{
                      marginRight: 10,
                      opacity: selectedAccounts.includes(account.account_id) ? 1 : 0.5,  // Gray out unselected accounts
                    }}
                  />
                  {account.account_name}
                </div>
              </Col>
            ))}
          </Checkbox.Group>
        </div>

        <h3>Create Post</h3>
        <div style={{ position: 'relative' }}>
          {/* Text Area for Post Content */}
          <Input.TextArea
            rows={6}  // Increase rows for a longer text box
            value={postContent}
            onChange={handlePostContentChange}
            placeholder="Write your post here..."
            style={{
              paddingRight: '30px',  // Add padding to the right to make space for the emoji icon
              minHeight: '120px', // Increase the height of the text box
            }}
          />

          {/* Emoji Icon, positioned within the text box */}
          <SmileOutlined
            ref={emojiButtonRef}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              cursor: 'pointer',
            }}
            onClick={() => setShowEmojiPicker((prev) => !prev)}  // Toggle emoji picker
          />
          
          {/* Emoji Picker Pop-up */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              style={{
                position: 'absolute',
                bottom: '40px', // Position the picker above the emoji icon
                right: '10px',
                zIndex: 1000,  // Ensure the picker is above other elements
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
          {/* Image Upload Button with Image Icon */}
          <Col>
            <Upload
              accept="image/*"
              listType="picture-card"
              onChange={handleImageChange}
              beforeUpload={() => false} // Disable auto-upload behavior
              multiple
              fileList={imageList}
            >
              <Button icon={<PictureOutlined />} type="text">
              </Button>
            </Upload>
          </Col>
        </Row>

        {/* If "Schedule Post" is selected, show DatePicker */}
        {postOption === 'schedule' && (
          <div style={{ marginTop: 20 }}>
            <h4>Schedule Post</h4>
            <DatePicker
              showTime
              value={scheduledDate ? moment(scheduledDate) : null}
              onChange={handleDateChange}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Dropdown for choosing Post Now or Schedule Post */}
        <div style={{ marginTop: 20 }}>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button>
              {postOption === 'now' ? 'Post Now' : 'Schedule Post'} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
    </Modal>
  );
};

export default NewPostModal;
