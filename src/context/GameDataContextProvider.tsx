import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import GameServices from "../services/GameServices";
import { GameType } from "../types/game.type";

interface GameDataContextType {
  games: GameType[];
  setGamesHandler: (games: GameType[]) => void;
}

interface propsType {
  children: ReactNode;
}

const initialGameDataContext: GameDataContextType = {
  games: [],
  setGamesHandler: (games: GameType[]) => {},
};

export const GameDataContext = createContext(initialGameDataContext);

const GameDataContextProvider: React.FC<propsType> = ({ children }) => {
  const [games, setGames] = useState<GameType[]>([]);

  const setGamesHandler = useCallback((games: GameType[]) => {
    setGames(games);
  }, []);

  const getGames = useCallback(async () => {
    const gameData = await GameServices.getGames();
    if (gameData) {
      const sortedGameData = [...gameData].sort((gameA, gameB) => {
        if (gameA.name < gameB.name) {
          return -1;
        } else if (gameA.name > gameB.name) {
          return 1;
        } else {
          return 0;
        }
      });
      setGames(sortedGameData);
    }
  }, []);

  useEffect(() => {
    getGames();
  }, [getGames]);

  return (
    <GameDataContext.Provider value={{ games, setGamesHandler }}>
      {children}
    </GameDataContext.Provider>
  );
};

export default GameDataContextProvider;
