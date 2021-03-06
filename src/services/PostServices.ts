import { API } from "aws-amplify";
import {
  AddCommentReqBodyData,
  AddCommentReqData,
  AddCommentResData,
  AddPostReqBodyData,
  AddPostReqData,
  AddPostResData,
  AddSubcommentReqBodyData,
  AddSubcommentReqData,
  AddSubcommentResData,
  Comment,
  CommentsLastEvaluatedKey,
  GetCommentsResData,
  GetGamePostsResData,
  GetPostsResData,
  GetSubcommentResData,
  LastEvaluatedKeyForPost,
  LastEvaluatedKeyForAllPost,
  LastEvaluatedKeyForGamePost,
  Post,
  RemovePostReqData,
  Subcomment,
  SubcommentsLastEvaluatedKey,
  UpdatePostReqData,
  UpdatePostResData,
  LastEvaluatedKeyForProfile,
  GetProfilePostsResData,
  GetUserPostsResData,
} from "../types/post.type";
import UserServices from "./UserServices";

export default class PostServices {
  private static apiName: string = "partyggApi";
  private static path: string = "/posts";
  private static commentsPath: string = "/comments";
  private static subcommentsPath: string = "/subcomments";
  private static lastEvaluatedKeyForAll:
    | LastEvaluatedKeyForAllPost
    | undefined = undefined;
  private static lastEvaluatedKeyForGame:
    | LastEvaluatedKeyForGamePost
    | undefined = undefined;
  private static lastEvaluatedKeyForUser: LastEvaluatedKeyForPost | undefined =
    undefined;
  private static lastEvaluatedKeyForProfile:
    | LastEvaluatedKeyForProfile
    | undefined = undefined;
  private static getDone: boolean = false;
  private static loading: boolean = false;

  public static init() {
    this.lastEvaluatedKeyForAll = undefined;
    this.lastEvaluatedKeyForGame = undefined;
    this.lastEvaluatedKeyForUser = undefined;
    this.lastEvaluatedKeyForProfile = undefined;
    this.getDone = false;
  }

  public static async addPost(newPost: AddPostReqData): Promise<Post | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      if (!username) {
        return null;
      }
      const myInit: { body: AddPostReqBodyData } = {
        body: {
          ...newPost,
          profileId: newPost.profile.id,
          username,
        },
      };
      const response = await API.post(this.apiName, this.path, myInit);
      const data: AddPostResData = response.data;
      return {
        ...data,
        likes: [],
        dislikes: [],
        comments: [],
      };
    } catch (error) {
      return null;
    }
  }

  public static async updatePost(postData: Post): Promise<Post | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const { game, profile, text, images } = postData;
      if (!username) {
        return null;
      }
      const updatePath = `${this.path}/object/${encodeURIComponent(
        username
      )}/${encodeURIComponent(postData.date)}`;
      const myInit: { body: UpdatePostReqData } = {
        body: {
          game,
          profile,
          text,
          images,
          username,
          profileId: profile.id,
        },
      };
      const response = await API.post(this.apiName, updatePath, myInit);
      const data: UpdatePostResData = response.data;
      return { ...postData, ...data };
    } catch (error) {
      return null;
    }
  }

  public static async removePost(data: RemovePostReqData): Promise<boolean> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      if (!username) {
        return false;
      }
      await API.del(
        this.apiName,
        `${this.path}/object/${encodeURIComponent(
          username
        )}/${encodeURIComponent(data.date)}`,
        {}
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  public static async getPosts(
    category: string,
    searchParam: string
  ): Promise<Post[] | null> {
    if (this.getDone || this.loading) {
      return [];
    }
    this.loading = true;

    if (category === "games" && searchParam) {
      const path = this.lastEvaluatedKeyForGame
        ? `${this.path}/game/${encodeURIComponent(
            this.lastEvaluatedKeyForGame.game
          )}/${encodeURIComponent(
            this.lastEvaluatedKeyForGame.username
          )}/${encodeURIComponent(this.lastEvaluatedKeyForGame.date)}`
        : `${this.path}/game/${searchParam}`;
      try {
        const response: GetGamePostsResData = await API.get(
          this.apiName,
          path,
          {}
        );
        if (!response.lastEvaluatedKey) {
          this.getDone = true;
        }
        this.lastEvaluatedKeyForGame = response.lastEvaluatedKey;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        return null;
      }
    }

    if (category === "usernames" && searchParam) {
      const path = this.lastEvaluatedKeyForUser
        ? `${this.path}/user/${encodeURIComponent(
            this.lastEvaluatedKeyForUser.username
          )}/${encodeURIComponent(this.lastEvaluatedKeyForUser.date)}`
        : `${this.path}/user/${searchParam}`;
      try {
        const response: GetUserPostsResData = await API.get(
          this.apiName,
          path,
          {}
        );
        if (!response.lastEvaluatedKey) {
          this.getDone = true;
        }
        this.lastEvaluatedKeyForUser = response.lastEvaluatedKey;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        return null;
      }
    }

    if (category === "profiles" && searchParam) {
      const path = this.lastEvaluatedKeyForProfile
        ? `${this.path}/profile/${encodeURIComponent(
            this.lastEvaluatedKeyForProfile.profileId
          )}/${encodeURIComponent(
            this.lastEvaluatedKeyForProfile?.username
          )}/${encodeURIComponent(this.lastEvaluatedKeyForProfile.date)}}`
        : `${this.path}/profile/${searchParam}`;
      try {
        const response: GetProfilePostsResData = await API.get(
          this.apiName,
          path,
          {}
        );
        if (!response.lastEvaluatedKey) {
          this.getDone = true;
        }
        this.lastEvaluatedKeyForProfile = response.lastEvaluatedKey;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        return null;
      }
    }
    const path = this.lastEvaluatedKeyForAll
      ? `${this.path}/${encodeURIComponent(
          this.lastEvaluatedKeyForAll.username
        )}/${encodeURIComponent(this.lastEvaluatedKeyForAll.date)}`
      : this.path;
    try {
      const response: GetPostsResData = await API.get(this.apiName, path, {});
      if (!response.lastEvaluatedKey) {
        this.getDone = true;
      }
      this.lastEvaluatedKeyForAll = response.lastEvaluatedKey;
      this.loading = false;
      return response.data;
    } catch (error) {
      this.loading = false;
      return null;
    }
  }

  public static async getUserPostIdListByGame(
    username: string,
    game: string
  ): Promise<GetPostsResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(
        username
      )}/game/${encodeURIComponent(game)}`;
      const response: GetPostsResData = await API.get(this.apiName, path, {});
      return response;
    } catch (error) {
      return null;
    }
  }

  public static async getNextUserPostByGame(
    game: string,
    data: LastEvaluatedKeyForPost
  ): Promise<GetPostsResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(
        data.username
      )}/game/${encodeURIComponent(game)}/${encodeURIComponent(data.date)}`;
      const response: GetPostsResData = await API.get(this.apiName, path, {});
      return response;
    } catch (error) {
      return null;
    }
  }

  public static async getPostData(postId: string): Promise<Post | null> {
    const pivot = postId.indexOf("/");
    const username = postId.slice(0, pivot);
    const date = postId.slice(pivot + 1, postId.length);
    try {
      const path = `${this.path}/object/${encodeURIComponent(
        username
      )}/${encodeURIComponent(date)}`;
      const response: Post = await API.get(this.apiName, path, {});
      return response;
    } catch (error) {
      return null;
    }
  }

  public static async getNextComments(
    lastEvaluatedKey: CommentsLastEvaluatedKey
  ): Promise<GetCommentsResData | null> {
    try {
      const path = `${this.commentsPath}/${encodeURIComponent(
        lastEvaluatedKey.postId
      )}/${encodeURIComponent(lastEvaluatedKey.date)}`;
      const response = await API.get(this.apiName, path, {});
      return response;
    } catch (error) {
      return null;
    }
  }

  public static async addComments(
    addCommentData: AddCommentReqData
  ): Promise<Comment | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const myInit: { body: AddCommentReqBodyData } = {
        body: {
          ...addCommentData,
          username,
        },
      };
      const response = await API.post(this.apiName, this.commentsPath, myInit);
      const data: AddCommentResData = response.data;
      return {
        ...data,
        subcomments: [],
      };
    } catch (error) {
      return null;
    }
  }

  public static async modifyComments(
    comment: Comment
  ): Promise<Comment | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const path = `${this.commentsPath}/object/${encodeURIComponent(
        comment.postId
      )}/${encodeURIComponent(comment.date)}`;
      const myInit: { body: Comment } = {
        body: {
          ...comment,
          username,
        },
      };
      const response = await API.post(this.apiName, path, myInit);
      const data: Comment = response.data;
      return data;
    } catch (err) {
      return null;
    }
  }

  public static async removeComments(data: Comment): Promise<boolean> {
    try {
      const path = `${this.commentsPath}/object/${encodeURIComponent(
        data.postId
      )}/${encodeURIComponent(data.date)}`;
      await API.del(this.apiName, path, {});
      return true;
    } catch (err) {
      return false;
    }
  }

  public static async getNextSubcomments(
    lastEvaluatedKey: SubcommentsLastEvaluatedKey
  ): Promise<GetSubcommentResData | null> {
    try {
      const path = `${this.subcommentsPath}/${encodeURIComponent(
        lastEvaluatedKey.commentId
      )}/${encodeURIComponent(lastEvaluatedKey.date)}`;
      const response = await API.get(this.apiName, path, {});
      return response;
    } catch (err) {
      return null;
    }
  }

  public static async addSubcomments(
    addSubcommentData: AddSubcommentReqData
  ): Promise<Subcomment | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const myInit: { body: AddSubcommentReqBodyData } = {
        body: {
          ...addSubcommentData,
          username,
        },
      };
      const response = await API.post(
        this.apiName,
        this.subcommentsPath,
        myInit
      );
      const data: AddSubcommentResData = response.data;
      return data;
    } catch (error) {
      return null;
    }
  }

  public static async modifySubcomments(
    subcomment: Subcomment
  ): Promise<Subcomment | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const path = `${this.subcommentsPath}/object/${encodeURIComponent(
        subcomment.commentId
      )}/${encodeURIComponent(subcomment.date)}`;
      const myInit: { body: AddSubcommentReqBodyData } = {
        body: {
          ...subcomment,
          username,
        },
      };
      const response = await API.post(this.apiName, path, myInit);
      const data: Subcomment = response.data;
      return data;
    } catch (err) {
      return null;
    }
  }

  public static async removeSubcomments(data: Subcomment): Promise<boolean> {
    try {
      const path = `${this.subcommentsPath}/object/${encodeURIComponent(
        data.commentId
      )}/${encodeURIComponent(data.date)}`;
      await API.del(this.apiName, path, {});
      return true;
    } catch (err) {
      return false;
    }
  }
}
