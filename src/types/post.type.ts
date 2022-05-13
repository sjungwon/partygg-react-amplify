import { UserResource } from "./db.type";
import { Profile } from "./profile.type";

//db 저장 형태
export interface PostStruct {
  //partition key
  game: string;
  profile: Profile;
  text: string;
}

export interface Post extends PostStruct, UserResource {
  //sort key
  date: string;
  images: string[] | null;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
}

export interface Comment extends PostStruct, UserResource {
  date: string;
  subComments: SubComment[];
}

export interface SubComment extends PostStruct, UserResource {
  date: string;
}

export type GetPostReqData = Post[];

export interface AddPostReqData extends PostStruct {
  images: string[] | null;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
}

export interface RemovePostReqData {
  game: string;
  date: string;
}
