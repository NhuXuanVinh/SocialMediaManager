import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';

const EngagementTrendChart = ({ data = [] }) => {
  const formatted = data.flatMap(d => [
    {
      date: d.date,
      value: Number(d.likes),
      type: 'Likes',
    },
    {
      date: d.date,
      value: Number(d.comments),
      type: 'Comments',
    },
    {
      date: d.date,
      value: Number(d.shares),
      type: 'Shares',
    },
  ]);

  const config = {
    data: formatted,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
        colorField: 'type',
    color: {
      Likes: '#1677ff',      // blue
      Comments: '#52c41a',   // green
      Shares: '#fa8c16',     // orange
    },
    height: 300,
    smooth: true,
    legend: { position: 'top' },
  };

  return (
    <Card title="Engagement Trend">
      <Line {...config} />
    </Card>
  );
};


export default EngagementTrendChart;
