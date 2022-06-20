import React, { createContext, ReactNode, useCallback, useState } from "react";
import GameServices from "../services/GameServices";
import { GameType } from "../types/game.type";

interface GameDataContextType {
  games: GameType[];
  setGamesHandler: (games: GameType[]) => void;
  getGames: () => void;
}

interface propsType {
  children: ReactNode;
}

const initialGameDataContext: GameDataContextType = {
  games: [],
  setGamesHandler: (games: GameType[]) => {},
  getGames: () => {},
};

export const GameDataContext = createContext(initialGameDataContext);

const sortGames = (games: GameType[]): GameType[] => {
  return [...games].sort((gameA, gameB) => {
    if (gameA.name < gameB.name) {
      return -1;
    } else if (gameA.name > gameB.name) {
      return 1;
    } else {
      return 0;
    }
  });
};

const GameDataContextProvider: React.FC<propsType> = ({ children }) => {
  const [games, setGames] = useState<GameType[]>([]);

  const setGamesHandler = useCallback((games: GameType[]) => {
    setGames(sortGames(games));
  }, []);

  const getGames = useCallback(async () => {
    const gameData = await GameServices.getGames();
    if (gameData) {
      setGames(sortGames(gameData));
    }
  }, []);

  return (
    <GameDataContext.Provider value={{ games, setGamesHandler, getGames }}>
      {children}
    </GameDataContext.Provider>
  );
};

export default GameDataContextProvider;
