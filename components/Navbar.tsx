import React from 'react';
import { ThemeColors, ThemeMode } from '../types';
import { Sun, Moon, Play, Share2, Layers } from 'lucide-react';

interface NavbarProps {
  theme: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  theme, 
  mode, 
  toggleTheme
}) => {
  return (
    <div 
      className="h-14 border-b flex items-center justify-between px-4 z-30 relative shadow-sm"
      style={{ 
        background: theme.surface, 
        borderColor: theme.stroke 
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
            <Layers className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ color: theme.text }}>
            Flow<span className="text-blue-500">Vision</span>
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded border ml-2 hidden sm:block" style={{ color: theme.textSecondary, borderColor: theme.stroke }}>
            Project Alpha
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-blue-50/50 p-1 rounded-lg border hidden md:flex" style={{ borderColor: theme.stroke }}>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"
          >
            <Play size={12} fill="currentColor" />
            DEPLOY
          </button>
          <button 
            className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
            style={{ color: theme.textSecondary }}
          >
            <Share2 size={16} />
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 transition-colors"
          style={{ color: theme.text }}
        >
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};