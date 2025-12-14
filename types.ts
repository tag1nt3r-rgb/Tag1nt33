import { ThemeKey } from "./utils/themes";

export interface CellData {
  id: string; // unique cell ID
  row: number;
  col: number;
  imageId: number | null; // The assigned image ID (1-7)
  isFixed: boolean; // True if pre-placed
  solutionImageId: number; // The correct image ID for this cell
}

export interface GameState {
  grid: CellData[];
  inventory: number[]; // Array of image IDs available to place
  status: 'loading' | 'playing' | 'won' | 'error';
  selectedInventoryItem: number | null; // Index in inventory array
  selectedCellId: string | null;
  errorMessage?: string;
}

export interface GeminiResponse {
  grid: number[][]; // 3 rows x 7 cols
}

export type { ThemeKey };
