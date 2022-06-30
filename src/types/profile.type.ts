import { UserResource } from "./db.type";
import { ImageKeys } from "./file.type";

export interface ProfileStruct {
  nickname: string;
  game: string;
  profileImage?: ImageKeys;
  credential?: ImageKeys;
}

export interface Profile extends ProfileStruct, UserResource {
  //partition key
  //username: string;
  //sort key
  id: string;
}

export interface AddProfileReqData extends ProfileStruct {}

export interface AddProfileResData {
  data: Profile;
}

export interface UpdateProfileReqdata extends Profile {}

export type GetProfilesResData = Profile[];

export interface RemoveProfileReqData {
  username: string;
  id: string;
}
