import React from 'react';

export interface ScoreColorInfo {
  stroke: string;
  text: string;
  gradeText: string;
  grade: string;
  tier: string;
}

export function getScoreColor(score: number): ScoreColorInfo {
  if (score >= 90) {
    return {
      stroke: 'var(--primary-600)',
      text: 'var(--primary-700)',
      gradeText: 'var(--primary-600)',
      grade: score >= 95 ? 'A+' : 'A',
      tier: 'Platinum Tier',
    };
  }
  if (score >= 80) {
    return {
      stroke: 'var(--primary-500)',
      text: 'var(--primary-600)',
      gradeText: 'var(--primary-500)',
      grade: score >= 85 ? 'B+' : 'B',
      tier: 'Gold Tier',
    };
  }
  if (score >= 70) {
    return {
      stroke: '#D97706', // Amber 600
      text: '#B45309',   // Amber 700
      gradeText: '#D97706', // Amber 600
      grade: score >= 75 ? 'C+' : 'C',
      tier: 'Silver Tier',
    };
  }
  if (score >= 50) {
    return {
      stroke: '#EA580C', // Orange 600
      text: '#C2410C',   // Orange 700
      gradeText: '#EA580C', // Orange 600
      grade: 'D',
      tier: 'Audited',
    };
  }
  return {
    stroke: '#E11D48', // Rose 600
    text: '#BE123C',   // Rose 700
    gradeText: '#E11D48', // Rose 600
    grade: 'F',
    tier: 'Under Review',
  };
}

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showGrade?: boolean;
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  showGrade = false,
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  const colorInfo = getScoreColor(score);

  return (
    <div
      className="relative grid shrink-0 place-items-center select-none"
      style={{ width: size, height: size }}
      aria-label={`BITAINTEL Trust Score ${score} of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          className="opacity-75"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorInfo.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-black tracking-tight leading-none ${
            size >= 60 ? 'text-base sm:text-lg' : size >= 44 ? 'text-xs' : 'text-[11px]'
          }`}
          style={{ color: colorInfo.text }}
        >
          {score}
        </span>
        {showGrade && size >= 42 && (
          <span
            className={`font-black leading-none mt-0.5 ${
              size >= 60 ? 'text-xs' : 'text-[9px]'
            }`}
            style={{ color: colorInfo.gradeText }}
          >
            {colorInfo.grade}
          </span>
        )}
      </div>
    </div>
  );
}
