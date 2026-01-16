// components/PostDetailsModal.jsx
import React from 'react';
import { Modal, Typography, Button } from 'antd';
import moment from 'moment';

const { Title, Paragraph } = Typography;

const PostDetailsModal = ({
  open,
  onClose,
  title,
  platform,
  accountName,
  status,
  datetime,
  postLink,
}) => {
  const formattedTime = datetime
    ? moment(datetime).format('MMM D, YYYY, HH:mm')
    : null;

  return (
    <Modal
      title="Post Details"
      open={open}
      onCancel={onClose}
      footer={[
        postLink && (
          <Button
            key="view"
            href={postLink}
            target="_blank"
            type="primary"
          >
            View Post
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Title level={5}>{title}</Title>
      <Paragraph>
        <b>Platform:</b> {platform}
        <br />
        <b>Account:</b> {accountName}
        <br />
        <b>Status:</b> {status}
        <br />
        {formattedTime && (
          <>
            <b>Time:</b> {formattedTime}
          </>
        )}
      </Paragraph>
    </Modal>
  );
};

export default PostDetailsModal;
