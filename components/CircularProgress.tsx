import React from 'react';

interface Props {
  current: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({ current, max, size = 20, strokeWidth = 2 }: Props) => {
  const percentage = Math.min((current / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return '#ef4444'; // red-500
    return '#3b82f6'; // blue-500
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.2s ease-in-out, stroke 0.2s ease-in-out'
          }}
        />
      </svg>
      {percentage >= 90 && (
        <div
          className={`absolute text-xs font-medium ${percentage >= 100 ? 'text-red-500' : 'text-amber-600'}`}
          style={{ fontSize: '8px' }}
        >
          {max - current}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;