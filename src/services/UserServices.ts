import { Auth } from "aws-amplify";
import { TokenRefreshResData } from "../types/user.type";

export default class UserServices {
  public static async getUsername(): Promise<string | null> {
    try {
      const { username } = await Auth.currentAuthenticatedUser();
      return username;
    } catch {
      return null;
    }
  }

  public static async getUsernameWithRefresh(): Promise<TokenRefreshResData> {
    try {
      const response = await Auth.currentSession();
      const token = response.getAccessToken().getJwtToken();
      console.log(token);
      const username = response.getAccessToken().payload.username;
      return {
        username,
        token: token,
        error: null,
      };
    } catch (error: any) {
      return {
        username: "",
        token: "",
        error: error,
      };
    }
  }
}
