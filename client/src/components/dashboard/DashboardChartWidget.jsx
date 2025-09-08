import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-bold">{`${label}`}</p>
        <p className="text-primary">{`Total: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

function DashboardChartWidget({ title, data, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-bold text-secondary ml-3">{title}</h3>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(229, 0, 126, 0.1)' }} />
            <Bar dataKey="value" fill="#e5007e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardChartWidget;