// components/Calendar/Calendar.jsx
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Button, Space, Avatar } from 'antd';
import moment from 'moment';
import {
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import PostDetailsModal from '../PostDetailsModal';

const localizer = momentLocalizer(moment);

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

const formattedEvents = events
  .filter((event) =>
    ['scheduled', 'posted'].includes(event.status)
  )
  .map((event) => {
    const start = new Date(event.date);
    const end = new Date(event.date);
    end.setMinutes(end.getMinutes() + 1000);

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
          onClick={() => {
            onView('month');
            setView('month');
          }}
        >
          Month
        </Button>
        <Button
          type={view === 'week' ? 'primary' : 'default'}
          onClick={() => {
            onView('week');
            setView('week');
          }}
        >
          Week
        </Button>
      </Space>
    </div>
  );

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
          {!isMonthView && <span className="event-time"> — {postTime}</span>}
        </span>
      </div>
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

      <PostDetailsModal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        platform={selectedEvent?.platform}
        accountName={selectedEvent?.accountName}
        status={selectedEvent?.status}
        datetime={selectedEvent?.start}
        postLink={selectedEvent?.postLink}
      />
    </div>
  );
};

export default CalendarComponent;
