import { API } from "aws-amplify";
import {
  GameType,
  GetGameResType,
  LastEvaluatedKeyForGame,
} from "../types/game.type";

export default class GameServices {
  private static apiName = "partyggApi";
  private static path = "/games";
  private static lastEvaluatedKey: LastEvaluatedKeyForGame | undefined =
    undefined;
  private static getDone: boolean = false;

  public static async init() {
    this.lastEvaluatedKey = undefined;
    this.getDone = false;
  }

  public static async getGames(): Promise<GameType[] | null> {
    if (this.getDone) {
      return null;
    }
    const path = this.lastEvaluatedKey
      ? `${this.path}/${this.lastEvaluatedKey.name}`
      : `${this.path}`;
    try {
      const response: GetGameResType = await API.get(this.apiName, path, {});
      if (!response.lastEvaluatedKey) {
        this.getDone = true;
      }
      this.lastEvaluatedKey = response.lastEvaluatedKey;
      return response.data;
    } catch {
      return null;
    }
  }

  public static async addGames(gameName: string): Promise<boolean> {
    const myInit: { body: GameType } = {
      body: {
        name: gameName,
      },
    };
    try {
      await API.post(this.apiName, this.path, myInit);
      return true;
    } catch {
      return false;
    }
  }
}
