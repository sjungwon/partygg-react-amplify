import { UserResource } from "./db.type";
import { Profile } from "./profile.type";

//db 저장 형태
export interface PostStruct {
  game: string;
  profile: Profile;
  text: string;
}

export interface Post extends PostStruct, UserResource {
  //partition key
  //username : string;
  //sort key
  date: string;
  images: string[] | null;
  likes: string[];
  dislikes: string[];
  // comments: Comment[];
}

export interface Comment extends PostStruct, UserResource {
  date: string;
  subComments: SubComment[];
}

export interface SubComment extends PostStruct, UserResource {
  date: string;
}

export interface LastEvaluatedKey {
  username: string;
  date: string;
}

export type GetPostReqData = Post[];

export interface GetPostResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKey;
}

export interface GetGamePostResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKey;
}

export interface AddPostReqData extends PostStruct {
  images: string[] | null;
}

export interface AddPostReqBodyData extends AddPostReqData, UserResource {}

export interface AddPostResData extends AddPostReqData, UserResource {
  date: string;
}

export interface UpdatePostReqData extends AddPostReqData, UserResource {
  date: string;
}

export interface UpdatePostResData extends AddPostResData {}

export interface RemovePostReqData extends LastEvaluatedKey {}
