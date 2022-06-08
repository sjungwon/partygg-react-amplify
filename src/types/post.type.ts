import { UserResource } from "./db.type";
import { ImageKeys } from "./file.type";
import { Profile } from "./profile.type";

//기본 post 구조
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
  images: ImageKeys[];
  likes: string[];
  dislikes: string[];
  comments: Comment[];
  commentsLastEvaluatedKey?: CommentsLastEvaluatedKey;
}

export interface LastEvaluatedKey {
  username: string;
  date: string;
}

export type GetPostReqData = Post[];

export interface LastEvaluatedKeyForAll extends LastEvaluatedKey {
  forall: string;
}

export interface LastEvaluatedKeyForGame extends LastEvaluatedKey {
  game: string;
}

export interface GetPostIdListResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForAll;
}

export interface GetGamePostIdListResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForGame;
}

export interface AddPostReqData extends PostStruct {
  images: ImageKeys[];
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

//comment
export interface Comment extends PostStruct, UserResource {
  postId: string;
  date: string;
  subcomments: Subcomment[];
  subcommentsLastEvaluatedKey?: SubcommentsLastEvaluatedKey;
}

export interface CommentsLastEvaluatedKey {
  postId: string;
  date: string;
}

export interface GetCommentsResData {
  data: Comment[];
  commentsLastEvaluatedKey?: CommentsLastEvaluatedKey;
}

export interface AddCommentReqData extends PostStruct {
  postId: string;
}

export interface AddCommentReqBodyData
  extends AddCommentReqData,
    UserResource {}

export interface AddCommentResData extends AddCommentReqBodyData {
  date: string;
}

//subcomment
export interface Subcomment extends PostStruct, UserResource {
  commentId: string;
  date: string;
}

export interface SubcommentsLastEvaluatedKey {
  commentId: string;
  date: string;
}

export interface GetSubcommentResData {
  data: Subcomment[];
  subcommentsLastEvaluatedKey?: SubcommentsLastEvaluatedKey;
}

export interface AddSubcommentReqData extends PostStruct {
  commentId: string;
}

export interface AddSubcommentReqBodyData
  extends AddSubcommentReqData,
    UserResource {}

export interface AddSubcommentResData extends AddSubcommentReqBodyData {
  date: string;
}
