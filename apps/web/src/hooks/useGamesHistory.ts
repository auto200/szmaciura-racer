import { nanoid } from "nanoid";
import { useLocalStorage } from "usehooks-ts";

export type GamesHistoryEntry = {
  id: string;
  timestamp: number;
  time: string;
};

export type GameHistory = { version: 1; history: GamesHistoryEntry[] };

type GamesHistory = Record<string, GameHistory>;

const INITIAL_GAME_HISTORY: GameHistory = {
  version: 1,
  history: [],
};

type UseGamesHistoryReturnType = {
  addToGamesHistory: (textId: string, time: string) => void;
  gamesHistory: GamesHistory;
};

export const useGamesHistory = (key: string): UseGamesHistoryReturnType => {
  const [gamesHistory, setGamesHistory] = useLocalStorage<GamesHistory>(
    key,
    {}
  );

  //TODO: store time as number
  const addToGamesHistory = (textId: string, time: string) => {
    const newHistoryEntry: GamesHistoryEntry = {
      id: nanoid(),
      timestamp: Date.now(),
      time,
    };

    const newGamesHistory: GamesHistory = {
      ...gamesHistory,
      [textId]: {
        ...(gamesHistory[textId] || INITIAL_GAME_HISTORY),
        history: [...(gamesHistory[textId]?.history || []), newHistoryEntry],
      },
    };

    setGamesHistory(newGamesHistory);
  };

  return { addToGamesHistory, gamesHistory };
};
