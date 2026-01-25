import React from 'react';
import { Avatar } from 'antd';
import {
  RetweetOutlined, MessageOutlined, HeartOutlined, ShareAltOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getImageSrc } from './utils';

const TwitterPreview = ({
  account, postContent, imageList, postOption, scheduledDate
}) => {
  const images = imageList?.map(getImageSrc).filter(Boolean) || [];
  const imageCount = images.length;
  const isScheduled = postOption === 'schedule' && scheduledDate;
  const displayTime = moment().format('HH:mm · MMM D, YYYY');

  const gridWrapper = {
    display: 'grid',
    gap: 2,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #e1e8ed',
    margin: '6px 16px'
  };

  const gridStyles = {
    1: { gridTemplateColumns: '1fr' },
    2: { gridTemplateColumns: '1fr 1fr' },
    3: { gridTemplateColumns: '2fr 1fr' },
    4: { gridTemplateColumns: '1fr 1fr' }
  };

  return (
    <div
      style={{
        maxWidth: 380, margin: '0 auto',
        borderRadius: 16, border: '1px solid #e1e8ed'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', padding: 12 }}>
        <Avatar style={{ marginRight: 8, backgroundColor: '#1DA1F2' }}>
          {account.account_name?.[0]}
        </Avatar>
        <div style={{ flex: 1 }}>
          <strong>{account.account_name}</strong>
          <div style={{ fontSize: 12, color: '#657786' }}>
            @{account.account_name?.toLowerCase().replace(/\s+/g, '')}
          </div>
        </div>
      </div>

      {/* Text */}
      <div 
        style={{padding: '0 16px 8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
      >
      {postContent}
      </div>

      {/* Images */}
      {imageCount > 0 && (
        <div style={{ ...gridWrapper, ...gridStyles[Math.min(imageCount, 4)] }}>
          {images.slice(0, 4).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{ width: '100%', objectFit: 'cover' }}
            />
          ))}
        </div>
      )}

      {/* Time */}
      <div style={{ padding: '0 16px 12px', fontSize: 12, color: '#657786' }}>
        {displayTime}
        {isScheduled && ' (scheduled)'}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        borderTop: '1px solid #e1e8ed'
      }}>
        <MessageOutlined /><RetweetOutlined /><HeartOutlined /><ShareAltOutlined />
      </div>
    </div>
  );
};

export default TwitterPreview;
