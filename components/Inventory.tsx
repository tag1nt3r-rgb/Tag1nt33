import React from 'react';
import { ThemeKey } from '../types';
import { getThemeImageSrc } from '../utils/themes';

interface InventoryProps {
  items: number[];
  selectedItemIndex: number | null;
  onItemClick: (index: number) => void;
  theme: ThemeKey;
}

export const Inventory: React.FC<InventoryProps> = ({ items, selectedItemIndex, onItemClick, theme }) => {
  if (items.length === 0) return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800 text-center">
        <p className="text-gray-500 italic">Inventar je prazan. Sretno!</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Vaše Slike ({items.length})</h3>
        <span className="text-xs text-gray-600">Odaberite za postavljanje</span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center min-h-[5rem]">
        {items.map((imgId, idx) => (
          <div
            key={idx}
            onClick={() => onItemClick(idx)}
            className={`
              relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer overflow-hidden transition-all duration-200
              ${selectedItemIndex === idx ? 'ring-4 ring-blue-500 scale-110 shadow-lg shadow-blue-500/50 z-10' : 'ring-2 ring-gray-700 hover:ring-gray-500 opacity-90 hover:opacity-100'}
            `}
          >
            <img 
              src={getThemeImageSrc(theme, imgId)} 
              alt={`Item ${imgId}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
