export interface GameType {
  name: string;
}

export interface LastEvaluatedKeyForGame {
  name: string;
}

export interface GetGameResType {
  data: GameType[];
  lastEvaluatedKey: LastEvaluatedKeyForGame;
}
