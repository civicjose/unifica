// src/components/dashboard/StatCard.jsx
import React from 'react';

// Acepta un ícono, título, valor y color como props
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    primary: 'from-primary to-purple-600',
    secondary: 'from-secondary to-purple-800',
    accent1: 'from-accent-1 to-teal-500',
    accent2: 'from-accent-2 to-cyan-500',
  };

  return (
    <div className={`transform rounded-xl bg-gradient-to-br p-6 text-white shadow-lg transition duration-300 hover:scale-105 ${colorClasses[color]}`}>
      <div className="flex items-center">
        <div className="mr-4 rounded-full bg-white/30 p-3">
          {icon}
        </div>
        <div>
          <p className="text-4xl font-bold">{value}</p>
          <p className="text-lg">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;