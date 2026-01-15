// components/analytics/AnalyticsTrendChart.jsx
import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';

const AnalyticsTrendChart = ({ data = [] }) => {
  const formatted = data.flatMap(d => [
    {
      date: d.date,
      value: Number(d.impressions),
      metric: 'Impressions',
    },
  ]);

  const config = {
    data: formatted,
    xField: 'date',
    yField: 'value',
    seriesField: 'metric',
    height: 300,
    smooth: true,
    legend: { position: 'top' },
  };

  return (
    <Card title="Impressions Over Time" style={{ marginBottom: 24 }}>
      <Line {...config} />
    </Card>
  );
};

export default AnalyticsTrendChart;
