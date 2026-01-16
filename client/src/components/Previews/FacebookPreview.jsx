import React from 'react';
import { Avatar } from 'antd';
import {
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { getImageSrc } from './utils';

const FacebookPreview = ({
  account,
  postContent,
  imageList,
  postOption,
  scheduledDate,
}) => {
  const isScheduled = postOption === 'schedule' && scheduledDate;
  const displayTime = isScheduled ? moment(scheduledDate).fromNow() : 'Just now';

  const images = imageList?.map(getImageSrc).filter(Boolean) || [];
  const imageCount = images.length;

  /** 🎯 Facebook Image Layout Rules */
  const renderImageLayout = () => {
    if (imageCount === 0) return null;

    if (imageCount === 1) {
      return (
        <div style={{ width: '100%', background: '#000' }}>
          <img
            src={images[0]}
            style={{ width: '100%', objectFit: 'cover', display: 'block' }}
            alt=""
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            background: '#000',
          }}
        >
          {images.slice(0, 2).map((src, i) => (
            <img key={i} src={src} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            background: '#000',
          }}
        >
          <img src={images[0]} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <img src={images[1]} style={{ width: '100%', height: 149, objectFit: 'cover' }} />
            <img src={images[2]} style={{ width: '100%', height: 149, objectFit: 'cover' }} />
          </div>
        </div>
      );
    }

    // 4+ images — use collage + overlay count
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          background: '#000',
        }}
      >
        {images.slice(0, 4).map((src, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={src} style={{ width: '100%', height: 200, objectFit: 'cover' }} />

            {i === 3 && imageCount > 4 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 26,
                }}
              >
                +{imageCount - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '0 auto',
        borderRadius: 10,
        border: '1px solid #ddd',
        background: '#fff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
        <Avatar size={40} style={{ marginRight: 8, backgroundColor: '#42b72a' }}>
          {account?.account_name?.[0]?.toUpperCase() || 'S'}
        </Avatar>

        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14 }}>
            {account?.account_name || 'Page Name'}
          </strong>
          <div style={{ fontSize: 12, color: '#65676b' }}>
            {displayTime} · 🌐
          </div>
        </div>

        <div style={{ fontSize: 20, color: '#65676b' }}>•••</div>
      </div>

      {/* Text */}
      <div style={{ padding: '0 12px 8px', fontSize: 14 }}>
        {postContent || (
          <span style={{ color: '#8d949e' }}>
            Your Facebook post will appear here…
          </span>
        )}
        {isScheduled && (
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            Scheduled for {moment(scheduledDate).format('MMM D, YYYY HH:mm')}
          </div>
        )}
      </div>

      {/* Images */}
      {renderImageLayout()}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px',
          borderTop: '1px solid #ccd0d5',
        }}
      >
        <button className="fb-preview-btn">
          <LikeOutlined /> Like
        </button>
        <button className="fb-preview-btn">
          <MessageOutlined /> Comment
        </button>
        <button className="fb-preview-btn">
          <ShareAltOutlined /> Share
        </button>
      </div>
    </div>
  );
};

export default FacebookPreview;
