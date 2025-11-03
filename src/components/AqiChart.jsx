import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function AqiChart() {
  const stateData = [
    { name: "Delhi", aqi: 285, color: "#ef4444" },
    { name: "Maharashtra", aqi: 120, color: "#f97316" },
    { name: "Karnataka", aqi: 85, color: "#84cc16" },
    { name: "Tamil Nadu", aqi: 65, color: "#84cc16" },
    { name: "West Bengal", aqi: 155, color: "#ef4444" },
    { name: "Gujarat", aqi: 110, color: "#f97316" },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">State AQI Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stateData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="aqi">
            {stateData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AqiChart;