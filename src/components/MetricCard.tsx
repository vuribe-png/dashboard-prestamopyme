import React from 'react';
import { COLORS } from '../constants';
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  isPercent?: boolean;
  color?: string;
  subValue?: string;
  comparisonValue?: number;
  forceColor?: boolean;
  previousValue?: number;
  invertTrendColor?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  isPercent = true, 
  color = COLORS.text, 
  subValue, 
  comparisonValue,
  forceColor = false,
  previousValue,
  invertTrendColor = false
}) => {
  
  const formatValue = (val: number, includeSign = false) => {
    if (isNaN(val)) return "N/A";
    const sign = includeSign && val > 0 ? '+' : '';
    return isPercent ? `${sign}${val.toFixed(2)}%` : val.toString();
  };

  let displayColor = color;
  let trendIcon = null;
  
  let realRate: number | null = null;
  if (typeof comparisonValue === 'number') {
      realRate = value - comparisonValue;
      if (realRate < 0) {
          trendIcon = <TrendingDown className="w-4 h-4" />;
          displayColor = COLORS.negative; 
      } else {
          trendIcon = <TrendingUp className="w-4 h-4" />;
          if (forceColor) {
              displayColor = color;
          } else {
              displayColor = COLORS.positive;
          }
      }
  }

  let momIcon = null;
  if (previousValue !== undefined) {
      const diff = value - previousValue;
      if (Math.abs(diff) > 0.001) {
          const isUp = diff > 0;
          const isGood = invertTrendColor ? !isUp : isUp;
          const colorClass = isGood ? 'text-green-500' : 'text-red-500';

          momIcon = (
              <div 
                className={`flex items-center gap-1 text-xs font-bold ${colorClass}`}
                title={`Variación: ${isUp ? '+' : ''}${diff.toFixed(2)}%`}
              >
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
          );
      } else {
          momIcon = (
              <div 
                className="flex items-center gap-1 text-xs font-bold text-green-500"
                title="Sin variación"
              >
                  <MoveRight className="w-4 h-4" />
              </div>
          );
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold flex items-center gap-1" style={{ color: displayColor }}>
          {typeof realRate === 'number' ? formatValue(realRate, true) : formatValue(value)}
          {trendIcon}
        </span>
        {subValue && <span className="text-sm text-slate-400 mb-1">{subValue}</span>}
      </div>
      
      <div className="mt-2 flex items-center justify-between">
          {typeof comparisonValue === 'number' && (
              <p className="text-xs text-slate-400">
                  Nominal: {formatValue(value)}
              </p>
          )}
          <div className="ml-auto">
              {momIcon}
          </div>
      </div>
    </div>
  );
};

export default MetricCard;