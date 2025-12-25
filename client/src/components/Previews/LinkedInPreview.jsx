import React from 'react';
import { Avatar } from 'antd';
import {
  LikeOutlined, MessageOutlined, ShareAltOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getImageSrc } from './utils';

const LinkedInPreview = ({
  account, postContent, imageList, postOption, scheduledDate
}) => {
  const images = imageList?.map(getImageSrc).filter(Boolean) || [];
  const extraCount = Math.max(0, images.length - 1);

  return (
    <div
      style={{
        maxWidth: 420, margin: '0 auto',
        borderRadius: 8, border: '1px solid #dcdcdc',
        background: '#fff'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', padding: 12 }}>
        <Avatar style={{ marginRight: 8, background: '#0077B5' }}>
          {account.account_name?.[0]}
        </Avatar>
        <div>
          <strong>{account.account_name}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>
            {moment().fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 12px 8px' }}>{postContent}</div>

      {/* Image */}
      {images.length > 0 && (
        <div style={{
          margin: '0 12px 12px',
          position: 'relative',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <img
            src={images[0]}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
          />

          {/* Extra Image Count Bubble */}
          {extraCount > 0 && (
            <div style={{
              position: 'absolute', right: 10, bottom: 10,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff', padding: '4px 10px',
              borderRadius: 16, fontSize: 12
            }}>
              +{extraCount} more
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: 10,
        borderTop: '1px solid #eee'
      }}>
        <LikeOutlined /> <MessageOutlined /> <ShareAltOutlined />
      </div>
    </div>
  );
};

export default LinkedInPreview;
