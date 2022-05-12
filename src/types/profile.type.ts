export interface ProfileStruct {
  //sort key
  nickname: string;
  game: string;
  profileImage: string;
}

export interface Profile extends ProfileStruct {
  //partition key
  username: string;
}

export interface AddProfileReqData extends ProfileStruct {}

export type GetProfilesResData = Profile[];
