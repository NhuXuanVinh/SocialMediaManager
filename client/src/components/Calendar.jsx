import { Calendar, Badge } from 'antd';

const CalendarComponent = ({ events }) => {
  const dateCellRender = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    const dayEvents = events.filter((event) => 
      new Date(event.date).toISOString().startsWith(formattedDate)
    );

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dayEvents.map((event, index) => (
          <li key={index}>
            <Badge
              status={event.status === 'posted' ? 'success' : 'warning'}
              text={`${event.content} (${event.platform})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  return <Calendar dateCellRender={dateCellRender} />;
};

export default CalendarComponent;
