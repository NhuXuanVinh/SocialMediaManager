import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Modal, Typography, Button, Space, Avatar } from 'antd';
import moment from 'moment';
import {
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const { Title, Paragraph } = Typography;
const localizer = momentLocalizer(moment);

// Platform icons
const platformIcons = {
  twitter: <TwitterOutlined style={{ color: '#1DA1F2' }} />,
  linkedin: <LinkedinOutlined style={{ color: '#0077B5' }} />,
  facebook: <FacebookOutlined style={{ color: '#1877F2' }} />,
  instagram: <InstagramOutlined style={{ color: '#E1306C' }} />,
};

const CalendarComponent = ({ events }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ Ensure week-view events are visible by giving short duration
  const formattedEvents = events.map((event) => {
    const start = new Date(event.date);
    const end = new Date(event.date);
    end.setMinutes(end.getMinutes() + 1000); // ensures visible block in week view
    return {
      title: event.content,
      start,
      end,
      platform: event.platform?.toLowerCase(),
      status: event.status,
      accountName: event.accountName,
      postLink: event.postLink,
    };
  });

  // ✅ Toolbar (Month/Week toggle)
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="rbc-toolbar-custom">
      <Space>
        <Button onClick={() => onNavigate('TODAY')}>Today</Button>
        <Button onClick={() => onNavigate('PREV')}>{'<'}</Button>
        <Button onClick={() => onNavigate('NEXT')}>{'>'}</Button>
      </Space>
      <span className="rbc-toolbar-label">{label}</span>
      <Space>
        <Button
          type={view === 'month' ? 'primary' : 'default'}
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button
          type={view === 'week' ? 'primary' : 'default'}
          onClick={() => onView('week')}
        >
          Week
        </Button>
      </Space>
    </div>
  );

  // ✅ Event card (month & week view look like cards)
  const EventCard = ({ event }) => {
    const icon = platformIcons[event.platform] || <Avatar size="small">?</Avatar>;
    const postTime = moment(event.start).format('HH:mm');
    const isMonthView = view === 'month';

    return (
      <div
        className={`event-card ${isMonthView ? 'month' : 'week'}`}
        onClick={() => setSelectedEvent(event)}
      >
        <span className="platform-icon">{icon}</span>
        <span className="event-title">
          {event.title}
          {!isMonthView && (
            <span className="event-time"> — {postTime}</span>
          )}
        </span>
      </div>
    );
  };

  // ✅ Event popup modal
  const EventPopup = ({ event, onClose }) => {
    if (!event) return null;

    return (
      <Modal
        title="Post Details"
        open={!!event}
        onCancel={onClose}
        footer={[
          event?.postLink && (
            <Button
              key="view"
              href={event.postLink}
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
        <Title level={5}>{event.title}</Title>
        <Paragraph>
          <b>Platform:</b> {event.platform}
          <br />
          <b>Account:</b> {event.accountName}
          <br />
          <b>Status:</b> {event.status}
          <br />
          <b>Time:</b> {moment(event.start).format('MMM D, YYYY, HH:mm')}
        </Paragraph>
      </Modal>
    );
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        views={['month', 'week']}
        defaultView="month"
        popup
        components={{
          event: EventCard,
          toolbar: CustomToolbar,
        }}
        style={{
          background: 'white',
          borderRadius: '10px',
          padding: '10px',
        }}
      />

      <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default CalendarComponent;
