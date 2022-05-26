import { API } from "aws-amplify";
import {
  AddProfileReqData,
  GetProfilesResData,
  Profile,
  UpdateProfileReqdata,
} from "../types/profile.type";
import UserServices from "./UserServices";

export default class ProfileServices {
  private static apiName: string = "partyggApi";

  public static async getProfiles(): Promise<GetProfilesResData | null> {
    const path = "/profiles";

    try {
      const { username } = await UserServices.getUsernameWithRefresh();

      const profiles: GetProfilesResData = await API.get(
        this.apiName,
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
        this.apiName,
        path,
        myInit
      );
      console.log(profiles);
    } catch (error) {
      console.log(error);
    }
  }

  public static async updateProfiles(
    data: UpdateProfileReqdata
  ): Promise<void> {
    const { username } = await UserServices.getUsernameWithRefresh();
    const path = `/profiles/object/${encodeURIComponent(
      username
    )}/${encodeURIComponent(data.date)}`;
    try {
      const myInit: { body: Profile } = {
        body: data,
      };
      const profiles: GetProfilesResData = await API.post(
        this.apiName,
        path,
        myInit
      );
      console.log(profiles);
    } catch (error) {
      console.log(error);
    }
  }

  public static async deleteProfiles(date: string) {
    const path = `/profiles/object`;
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const response = await API.del(
        this.apiName,
        `${path}/${encodeURIComponent(username)}/${encodeURIComponent(date)}`,
        {}
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
