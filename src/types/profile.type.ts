import { UserResource } from "./db.type";

export interface ProfileStruct {
  nickname: string;
  game: string;
  profileImage: string;
}

export interface Profile extends ProfileStruct, UserResource {
  //partition key
  username: string;
  //sort key
  date: string;
}

export interface AddProfileReqData extends ProfileStruct {}

export interface AddProfileResData {
  data: Profile;
}

export interface UpdateProfileReqdata extends Profile {}

export type GetProfilesResData = Profile[];

export interface RemoveProfileReqData {
  username: string;
  nickname: string;
}
