import React from 'react';
import { Position, ThemeColors } from '../types';

interface ConnectionProps {
  start: Position;
  end: Position;
  theme: ThemeColors;
  active?: boolean;
}

export const ConnectionLine: React.FC<ConnectionProps> = ({ start, end, theme, active }) => {
  // Calculate control points for Bezier curve
  const deltaX = Math.abs(end.x - start.x);
  const controlPointOffset = Math.max(deltaX * 0.5, 50);

  const path = `
    M ${start.x} ${start.y}
    C ${start.x + controlPointOffset} ${start.y},
      ${end.x - controlPointOffset} ${end.y},
      ${end.x} ${end.y}
  `;

  return (
    <g className="group">
      {/* Hover Target (wider invisible path) */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
      />
      {/* Visible Path */}
      <path
        d={path}
        fill="none"
        stroke={theme.stroke}
        strokeWidth={2}
        className="transition-colors duration-300 group-hover:stroke-blue-400"
      />
      {/* Animated Flow (if active) */}
      {active && (
        <path
          d={path}
          fill="none"
          stroke={theme.primary}
          strokeWidth={2}
          strokeDasharray="8,8"
          className="animate-flow"
          style={{
            animation: 'dash 1s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </g>
  );
};