import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from './components/Grid';
import { Inventory } from './components/Inventory';
import { generateGameLevel } from './services/geminiService';
import { GameState, CellData, ThemeKey } from './types';
import { THEMES } from './utils/themes';
import { Loader2, RefreshCcw, Trophy, AlertTriangle, HelpCircle, Palette } from 'lucide-react';

const TOTAL_ROWS = 3;
const TOTAL_COLS = 7;
// We hide 3 cells per row = 9 total
const HIDDEN_PER_ROW = 3;

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('animals');
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    inventory: [],
    status: 'loading',
    selectedInventoryItem: null,
    selectedCellId: null,
  });

  const [showRules, setShowRules] = useState(false);

  const initGame = useCallback(async () => {
    setGameState(prev => ({ ...prev, status: 'loading', errorMessage: undefined }));
    try {
      const response = await generateGameLevel();
      const rawGrid = response.grid;

      if (!rawGrid || rawGrid.length !== TOTAL_ROWS || rawGrid[0].length !== TOTAL_COLS) {
        throw new Error("Invalid grid dimensions received from AI");
      }

      // Flatten grid to cells
      const cells: CellData[] = [];
      
      rawGrid.forEach((rowVals, rIdx) => {
        rowVals.forEach((val, cIdx) => {
          cells.push({
            id: `${rIdx}-${cIdx}`,
            row: rIdx,
            col: cIdx,
            solutionImageId: val,
            imageId: val, // Initially full
            isFixed: true
          });
        });
      });

      // Select 3 random indices to hide for EACH row
      const hiddenIndicesSet = new Set<number>();
      
      for (let r = 0; r < TOTAL_ROWS; r++) {
        // Create an array of column indices [0, 1, ... 6]
        const colIndices = Array.from({ length: TOTAL_COLS }, (_, i) => i);
        // Shuffle them
        for (let i = colIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [colIndices[i], colIndices[j]] = [colIndices[j], colIndices[i]];
        }
        // Take the first 3
        const colsToHide = colIndices.slice(0, HIDDEN_PER_ROW);
        
        // Convert to absolute index in the 'cells' array
        colsToHide.forEach(c => {
          hiddenIndicesSet.add(r * TOTAL_COLS + c);
        });
      }

      const initialInventory: number[] = [];

      hiddenIndicesSet.forEach(idx => {
        const cell = cells[idx];
        initialInventory.push(cell.solutionImageId);
        cell.imageId = null;
        cell.isFixed = false;
      });

      // Shuffle inventory to prevent guessing by order
      initialInventory.sort(() => Math.random() - 0.5);

      setGameState({
        grid: cells,
        inventory: initialInventory,
        status: 'playing',
        selectedInventoryItem: null,
        selectedCellId: null
      });

    } catch (error) {
      console.error(error);
      setGameState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: "Neuspješno generiranje zagonetke. Pokušajte ponovno." 
      }));
    }
  }, []);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellClick = (cellId: string) => {
    if (gameState.status !== 'playing') return;
    
    const cellIndex = gameState.grid.findIndex(c => c.id === cellId);
    const cell = gameState.grid[cellIndex];

    // If trying to modify fixed cell, ignore
    if (cell.isFixed) return;

    // SCENARIO 1: Placing an item from inventory
    if (gameState.selectedInventoryItem !== null) {
      // If cell already has an image, return it to inventory first
      const newInventory = [...gameState.inventory];
      const imageToPlace = newInventory[gameState.selectedInventoryItem];
      
      // Remove placed item from inventory
      newInventory.splice(gameState.selectedInventoryItem, 1);
      
      // If the target cell was not empty, push its current value back to inventory
      if (cell.imageId !== null) {
        newInventory.push(cell.imageId);
      }

      const newGrid = [...gameState.grid];
      newGrid[cellIndex] = { ...cell, imageId: imageToPlace };

      setGameState({
        ...gameState,
        grid: newGrid,
        inventory: newInventory,
        selectedInventoryItem: null,
        selectedCellId: null
      });
      
      checkWinCondition(newGrid);
      return;
    }

    // SCENARIO 2: Clicking a filled (non-fixed) cell to remove/return to inventory
    if (cell.imageId !== null) {
      const newInventory = [...gameState.inventory, cell.imageId];
      const newGrid = [...gameState.grid];
      newGrid[cellIndex] = { ...cell, imageId: null };
      
      setGameState({
        ...gameState,
        grid: newGrid,
        inventory: newInventory,
        selectedInventoryItem: null,
        selectedCellId: null
      });
      return;
    }

    // SCENARIO 3: Clicking an empty cell -> Just toggle selection for UI feedback
    setGameState(prev => ({ ...prev, selectedCellId: cellId === prev.selectedCellId ? null : cellId }));
  };

  const handleInventoryClick = (index: number) => {
    if (gameState.status !== 'playing') return;
    setGameState(prev => ({
      ...prev,
      selectedInventoryItem: prev.selectedInventoryItem === index ? null : index,
      selectedCellId: null // Clear cell selection if picking from inventory
    }));
  };

  const checkWinCondition = (currentGrid: CellData[]) => {
    // 1. All cells filled?
    if (currentGrid.some(c => c.imageId === null)) return;

    // 2. Check against solution
    const isWin = currentGrid.every(c => c.imageId === c.solutionImageId);
    
    if (isWin) {
      setGameState(prev => ({ ...prev, status: 'won' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold text-white">7</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Zagonetka Sedam Simbola
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                <Palette size={16} className="text-gray-400" />
                <select 
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value as ThemeKey)}
                  className="bg-transparent border-none outline-none text-sm text-gray-200 cursor-pointer appearance-none pr-4 font-medium"
                  style={{ backgroundImage: 'none' }}
                >
                  {THEMES.map(t => (
                    <option key={t.id} value={t.id} className="bg-gray-900 text-gray-200">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-800 mx-1"></div>

            <button 
              onClick={() => setShowRules(!showRules)}
              className={`p-2 rounded-full transition-colors ${showRules ? 'bg-blue-900/50 text-blue-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              title="Pravila"
            >
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={initGame}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              title="Nova Igra"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center">
        
        {/* Rules Modal / Panel */}
        {showRules && (
          <div className="max-w-4xl w-full mb-6 p-6 bg-gray-900/80 border border-gray-700 rounded-lg text-sm text-gray-300 animate-in fade-in slide-in-from-top-4 shadow-xl">
            <h3 className="font-bold text-blue-400 mb-3 text-lg">Pravila Igre</h3>
            <ul className="list-disc list-inside space-y-2 opacity-90 leading-relaxed">
              <li><strong className="text-gray-200">Mreža:</strong> Drevna ploča veličine 7 stupaca x 3 reda.</li>
              <li><strong className="text-gray-200">Pravilo 1:</strong> Svaki red mora sadržavati točno jednu od svake od 7 slika.</li>
              <li><strong className="text-gray-200">Pravilo 2:</strong> Niti jedan stupac nije identičan. Svaki par slika smije se pojaviti zajedno u stupcu samo jednom.</li>
              <li><strong className="text-gray-200">Cilj:</strong> Postavite 9 nedostajućih slika na prazna polja (3 prazna polja po redu) kako biste ispunili uvjete.</li>
            </ul>
          </div>
        )}

        {/* Game Status Feedback */}
        {gameState.status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-gray-400 animate-pulse">Generiranje logičke mreže...</p>
          </div>
        )}

        {gameState.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <AlertTriangle className="text-red-500" size={48} />
            <p className="text-red-300 max-w-md">{gameState.errorMessage}</p>
            <button 
              onClick={initGame}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold transition-colors"
            >
              Pokušaj ponovno
            </button>
          </div>
        )}

        {(gameState.status === 'playing' || gameState.status === 'won') && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-in zoom-in-95 duration-500">
            
            {/* Success Banner */}
            {gameState.status === 'won' && (
              <div className="w-full p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl flex flex-col items-center text-center gap-2 animate-bounce-in shadow-lg shadow-green-900/20">
                <Trophy className="text-yellow-400 w-12 h-12 mb-2 drop-shadow-md" />
                <h2 className="text-2xl font-bold text-green-100">Zagonetka Riješena!</h2>
                <p className="text-green-200">Mreža je savršeno uravnotežena.</p>
                <button 
                  onClick={initGame}
                  className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-lg shadow-green-600/30 transition-all hover:scale-105"
                >
                  Igraj ponovno
                </button>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <Grid 
                grid={gameState.grid} 
                onCellClick={handleCellClick}
                selectedCellId={gameState.selectedCellId}
                theme={currentTheme}
              />
            </div>

            <Inventory 
              items={gameState.inventory} 
              selectedItemIndex={gameState.selectedInventoryItem}
              onItemClick={handleInventoryClick}
              theme={currentTheme}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-600 text-xs border-t border-gray-900 bg-gray-950">
        <p>Izrađeno s React-om & Gemini 2.5 • Slike generira Pollinations AI</p>
      </footer>
    </div>
  );
}
