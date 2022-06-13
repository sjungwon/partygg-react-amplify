import { Auth } from "aws-amplify";
import { UserRefreshResData } from "../types/user.type";

export default class UserServices {
  public static async getUsername(): Promise<string | null> {
    try {
      const { username } = await Auth.currentAuthenticatedUser();
      return username;
    } catch {
      return null;
    }
  }

  public static async getUsernameWithRefresh(): Promise<UserRefreshResData> {
    try {
      const response = await Auth.currentSession();
      const username = response.getAccessToken().payload.username;
      return {
        username,
        error: null,
      };
    } catch (error: any) {
      return {
        username: "",
        error: error,
      };
    }
  }
}
