import { API } from "aws-amplify";
import { AddProfileReqData, GetProfilesResData } from "../types/profile.type";
import UserServices from "./UserServices";

export default class ProfileServices {
  public static async getProfiles(): Promise<GetProfilesResData | null> {
    const apiName = "partyggApi";
    const path = "/profiles";
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const profiles = await API.get(
        apiName,
        `${path}/${encodeURIComponent(username)}`,
        {}
      );
      console.log(profiles);
      return profiles;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async postProfiles(data: AddProfileReqData): Promise<void> {
    const apiName = "partyggApi";
    const path = "/profiles";
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const myInit = {
        body: {
          username,
          nickname: data.nickname,
          game: data.game,
          profileImage: data.profileImage,
        },
      };
      const profiles: GetProfilesResData = await API.post(
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
