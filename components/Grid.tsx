import React from 'react';
import { CellData, ThemeKey } from '../types';
import { getThemeImageSrc } from '../utils/themes';
import { Lock } from 'lucide-react';

interface GridProps {
  grid: CellData[];
  onCellClick: (cellId: string) => void;
  selectedCellId: string | null;
  theme: ThemeKey;
}

export const Grid: React.FC<GridProps> = ({ grid, onCellClick, selectedCellId, theme }) => {
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-4xl mx-auto p-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      {grid.map((cell) => {
        const isSelected = cell.id === selectedCellId;
        const hasContent = cell.imageId !== null;

        return (
          <div
            key={cell.id}
            onClick={() => onCellClick(cell.id)}
            className={`
              relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all duration-200
              ${cell.isFixed ? 'border border-gray-600 opacity-90' : 'border-2 border-dashed border-gray-500 bg-gray-700/30 hover:bg-gray-700'}
              ${isSelected ? 'ring-4 ring-yellow-400 z-10 scale-105' : ''}
              ${!hasContent && !cell.isFixed ? 'flex items-center justify-center group' : ''}
            `}
          >
            {hasContent ? (
              <>
                <img 
                  src={getThemeImageSrc(theme, cell.imageId!)} 
                  alt={`Symbol ${cell.imageId}`} 
                  className="w-full h-full object-cover"
                />
                {cell.isFixed && (
                  <div className="absolute top-1 right-1 bg-black/60 p-1 rounded-full backdrop-blur-sm">
                    <Lock size={10} className="text-white/90" />
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-500 text-[10px] sm:text-xs font-bold opacity-30 group-hover:opacity-60 transition-opacity">Prazno</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
