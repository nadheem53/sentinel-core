import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface HealthGaugeProps {
  score: number; // 0 - 100
  size?: number;
  showIcon?: boolean;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  score,
  size = 140,
  showIcon = true,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10b981'; // Green
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let label = 'EXCELLENT';
  let Icon = ShieldCheck;

  if (clampedScore < 50) {
    strokeColor = '#f43f5e'; // Crimson
    glowColor = 'rgba(244, 63, 94, 0.5)';
    label = 'CRITICAL';
    Icon = ShieldAlert;
  } else if (clampedScore < 80) {
    strokeColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    label = 'ATTENTION';
    Icon = Shield;
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(31, 41, 61, 0.6)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Glowing Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
            transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center Score Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        {showIcon && <Icon className="w-5 h-5 mb-0.5" style={{ color: strokeColor }} />}
        <span className="text-2xl font-bold font-display tracking-tight text-white leading-none">
          {clampedScore}
          <span className="text-xs font-normal text-slate-400 ml-0.5">%</span>
        </span>
        <span
          className="text-[9px] font-mono uppercase tracking-wider font-semibold mt-0.5"
          style={{ color: strokeColor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
