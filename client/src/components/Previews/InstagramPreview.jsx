import React from 'react';
import { Avatar } from 'antd';
import {
  HeartOutlined, MessageOutlined, ShareAltOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getImageSrc } from './utils';

const InstagramPreview = ({
  account, postContent, imageList, postOption, scheduledDate
}) => {
  const isScheduled = postOption === 'schedule' && scheduledDate;
  const images = imageList?.map(getImageSrc).filter(Boolean) || [];
  const showCarousel = images.length > 1;

  return (
    <div
      style={{
        maxWidth: 360, margin: '0 auto',
        borderRadius: 12, border: '1px solid #dbdbdb',
        background: '#fff', overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', padding: 10 }}>
        <Avatar style={{ marginRight: 8, backgroundColor: '#E1306C' }}>
          {account.account_name?.[0]?.toUpperCase()}
        </Avatar>
        <strong>{account.account_name}</strong>
        <div style={{ marginLeft: 'auto' }}>•••</div>
      </div>

      {/* Image Section */}
      {images.length > 0 && (
        <div style={{ width: '100%', background: '#000', position: 'relative' }}>
          <img
            src={images[0]}
            alt=""
            style={{
              width: '100%',
              display: 'block',
              aspectRatio: '1 / 1',
              objectFit: 'cover'
            }}
          />

          {/* Carousel Dots */}
          {showCarousel && (
            <div style={{
              position: 'absolute',
              bottom: 10,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: 6
            }}>
              {images.map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === 0 ? '#fff' : '#888'
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', padding: 10, gap: 12 }}>
        <HeartOutlined /> <MessageOutlined /> <ShareAltOutlined />
      </div>

      {/* Caption */}
      <div style={{ padding: '0 10px 10px', whiteSpace: 'pre-wrap',
    wordBreak: 'break-word', }}>
        <strong>{account.account_name}</strong> {postContent}
        {isScheduled && (
          <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 4 }}>
            Scheduled: {moment(scheduledDate).format('MMM D, YYYY HH:mm')}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPreview;
