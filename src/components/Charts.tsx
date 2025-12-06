import React, { memo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FinancialData } from '../types';
import { COLORS } from '../constants';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50 pointer-events-none">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value.toFixed(2)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface TrendChartProps {
  data: FinancialData[];
  onHover?: (data: FinancialData | null) => void;
}

export const TrendLineChart = memo(({ data, onHover }: TrendChartProps) => {
  const allValues = data.flatMap(d => [d.inflation, d.rate_181_360, d.rate_mas_360]);
  let minVal = allValues.length > 0 ? Math.floor(Math.min(...allValues)) : 0;
  let maxVal = allValues.length > 0 ? Math.ceil(Math.max(...allValues)) : 10;
  
  if (minVal === maxVal) maxVal += 1;
  
  const ticks = [];
  if (allValues.length > 0) {
      for (let i = minVal; i <= maxVal; i++) ticks.push(i);
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        onMouseMove={(state: any) => {
           // Lógica corregida para detectar datos
           if (state && state.activePayload && state.activePayload.length > 0) {
               if (onHover) {
                   onHover(state.activePayload[0].payload);
               }
           }
        }}
        onMouseLeave={() => {
            if (onHover) onHover(null);
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
            type="number"
            domain={[minVal, maxVal]}
            ticks={ticks}
            interval={0}
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="plainline" />
        
        <Line 
            type="monotone" 
            dataKey="inflation" 
            name="Inflación" 
            stroke={COLORS.inflation} 
            strokeWidth={2.5} 
            dot={false} 
            activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.inflation }} 
            isAnimationActive={false}
        />
        <Line 
            type="monotone" 
            dataKey="rate_181_360" 
            name="Tasa 181-360d" 
            stroke={COLORS.rate181} 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.rate181 }}
            isAnimationActive={false}
        />
        <Line 
            type="monotone" 
            dataKey="rate_mas_360" 
            name="Tasa >360d" 
            stroke={COLORS.rate360} 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.rate360 }}
            isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});