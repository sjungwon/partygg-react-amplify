import { API, Auth } from "aws-amplify";
import {
  ProfilePostReqData,
  ProfilesGetResData,
  TokenRefreshResData,
} from "../types/UserServices.type";

export default class UserServices {
  public static async getUsername(): Promise<string | null> {
    try {
      const { username } = await Auth.currentAuthenticatedUser();
      return username;
    } catch {
      return null;
    }
  }

  public static async tokenRefresh(): Promise<TokenRefreshResData> {
    try {
      const response = await Auth.currentSession();
      const accessToken = response.getAccessToken();
      const jwtToken = accessToken.getJwtToken();
      const username = accessToken.payload.username;
      return {
        username,
        token: jwtToken,
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

  public static async getProfiles(): Promise<ProfilesGetResData | null> {
    const apiName = "partyggProfileApi";
    const path = "/profiles";
    try {
      const { username } = await this.tokenRefresh();
      const profiles = await API.get(
        apiName,
        `${path}/${encodeURI(username)}`,
        {}
      );
      console.log(profiles);
      return profiles;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async postProfiles(data: ProfilePostReqData) {
    const apiName = "partyggProfileApi";
    const path = "/profiles";
    const { username } = await this.tokenRefresh();
    const myInit = {
      body: {
        username: username,
        nickname: data.nickname,
        game: data.game,
        profileImage: data.profileImage,
      },
    };
    try {
      const profiles: ProfilesGetResData = await API.post(
        apiName,
        path,
        myInit
      );
      console.log(profiles);
    } catch (error) {
      console.log(error);
    }
  }
}
