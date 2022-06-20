import { UserResource } from "./db.type";
import { ImageKeys } from "./file.type";
import { Profile } from "./profile.type";

//기본 post 구조
export interface PostStruct {
  profileId: string;
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

export interface LastEvaluatedKeyForPost {
  username: string;
  date: string;
}

export type GetPostReqData = Post[];

export interface LastEvaluatedKeyForAllPost extends LastEvaluatedKeyForPost {
  forall: string;
}

export interface LastEvaluatedKeyForGamePost extends LastEvaluatedKeyForPost {
  game: string;
}

export interface LastEvaluatedKeyForProfile extends LastEvaluatedKeyForPost {
  profileId: string;
}

export interface GetPostsResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForAllPost;
}

export interface GetGamePostsResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForGamePost;
}

export interface GetUserPostsResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForPost;
}

export interface GetProfilePostsResData {
  data: Post[];
  lastEvaluatedKey?: LastEvaluatedKeyForProfile;
}

export interface AddPostReqData extends PostStruct {
  profileId: string;
  images: ImageKeys[];
}

export interface AddPostReqBodyData extends AddPostReqData, UserResource {}

export interface AddPostResData extends AddPostReqData, UserResource {
  date: string;
}

export interface UpdatePostReqData extends AddPostReqData, UserResource {}

export interface UpdatePostResData extends AddPostResData {}

export interface RemovePostReqData extends LastEvaluatedKeyForPost {}

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
