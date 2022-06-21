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
  private static path: string = "/profiles";

  public static async getProfiles(
    otherUsername?: string
  ): Promise<GetProfilesResData | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();

      const path = otherUsername
        ? `${this.path}/${encodeURIComponent(otherUsername)}`
        : `${this.path}/${encodeURIComponent(username)}`;
      const profiles: GetProfilesResData = await API.get(
        this.apiName,
        path,
        {}
      );
      console.log(profiles);
      return profiles;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private static removedProfileGen = (profileId: string): Profile => {
    return {
      id: profileId,
      username: "",
      nickname: "삭제된 프로필",
      game: "",
      profileImage: undefined,
    };
  };

  public static async getProfileById(
    profileId: string
  ): Promise<Profile | null> {
    try {
      const path = `${this.path}/object/${profileId}`;
      const profile: Profile[] = await API.get(this.apiName, path, {});
      console.log(profile);
      if (!profile.length) {
        return this.removedProfileGen(profileId);
      }
      return profile[0];
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
