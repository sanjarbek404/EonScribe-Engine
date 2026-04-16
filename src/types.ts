export enum ImageSize {
  S1K = "1K",
  S2K = "2K",
  S4K = "4K"
}

export interface GameState {
  inventory: string[];
  currentQuest: string;
  location: string;
  characterDescription: string;
  visualStyle: string;
}

export interface StoryTurn {
  id: string;
  narrative: string;
  options: string[];
  imagePrompt: string;
  imageUrl?: string;
  gameState: GameState;
  timestamp: number;
}

export interface GameSession {
  history: StoryTurn[];
  currentState: GameState;
}
