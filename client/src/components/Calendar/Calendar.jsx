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

const normalizeToGrid = (date, step = 30) => {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const rounded = Math.floor(minutes / step) * step;
  d.setMinutes(rounded, 0, 0);
  return d;
};

const CalendarComponent = ({ events }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

const formattedEvents = events
  .filter(e => ['scheduled', 'posted'].includes(e.status))
  .map(e => {
    const start = normalizeToGrid(e.date, 30);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    return {
      title: e.content,
      start,
      end,
      allDay: false,
      platform: e.platform?.toLowerCase(),
      status: e.status,
      accountName: e.accountName,
      postLink: e.postLink,
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
        
  step={30}          // ⬅ matches event duration
  timeslots={1}      // ⬅ prevents stretching
  popup={false} 
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
