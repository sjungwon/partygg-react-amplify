import { API } from "aws-amplify";
import {
  AddProfileReqData,
  AddProfileResData,
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

  public static async addProfile(
    data: AddProfileReqData
  ): Promise<Profile | null> {
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
      const response: AddProfileResData = await API.post(
        this.apiName,
        path,
        myInit
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async updateProfile(
    data: UpdateProfileReqdata
  ): Promise<Profile | null> {
    const { username } = await UserServices.getUsernameWithRefresh();
    const path = `/profiles/object/${encodeURIComponent(
      username
    )}/${encodeURIComponent(data.id)}`;
    try {
      const myInit: { body: Profile } = {
        body: data,
      };
      const profile: { data: Profile } = await API.post(
        this.apiName,
        path,
        myInit
      );
      console.log(profile);
      return profile.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async deleteProfile(id: string): Promise<boolean> {
    const path = `/profiles/object`;
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const response = await API.del(
        this.apiName,
        `${path}/${encodeURIComponent(username)}/${encodeURIComponent(id)}`,
        {}
      );
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
