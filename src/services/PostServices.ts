import { API } from "aws-amplify";
import {
  AddPostReqBodyData,
  AddPostReqData,
  AddPostResData,
  GetGamePostResData,
  GetPostResData,
  LastEvaluatedKey,
  Post,
  RemovePostReqData,
  UpdatePostReqData,
  UpdatePostResData,
} from "../types/post.type";
import UserServices from "./UserServices";

export default class PostServices {
  private static apiName: string = "partyggApi";
  private static path: string = "/posts";

  public static async addPost(newPost: AddPostReqData): Promise<Post | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      if (!username) {
        return null;
      }
      const myInit: { body: AddPostReqBodyData } = {
        body: {
          ...newPost,
          username,
        },
      };
      const response = await API.post(this.apiName, this.path, myInit);
      console.log(response);
      const data: AddPostResData = response.data;
      return {
        ...data,
        likes: [],
        dislikes: [],
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async updatePost(postData: Post): Promise<Post | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const { game, profile, text, date, images } = postData;
      if (!username) {
        return null;
      }
      const updatePath = `${this.path}/object/${encodeURIComponent(
        username
      )}/${encodeURIComponent(date)}`;
      const myInit: { body: UpdatePostReqData } = {
        body: {
          date,
          game,
          profile,
          text,
          images,
          username,
        },
      };
      const response = await API.post(this.apiName, updatePath, myInit);
      const data: UpdatePostResData = response.data;
      return { ...postData, ...data };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async removePost(data: RemovePostReqData): Promise<boolean> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      if (!username) {
        return false;
      }
      const response = await API.del(
        this.apiName,
        `${this.path}/object/${encodeURIComponent(
          username
        )}/${encodeURIComponent(data.date)}`,
        {}
      );
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async getPost(): Promise<GetPostResData | null> {
    try {
      const response: GetPostResData = await API.get(
        this.apiName,
        this.path,
        {}
      );
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getNextPost(
    data: LastEvaluatedKey
  ): Promise<GetPostResData | null> {
    try {
      const path = `${this.path}/${encodeURIComponent(
        data.username
      )}/${encodeURIComponent(data.date)}`;
      const response: GetPostResData = await API.get(this.apiName, path, {});
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getPostByGame(
    game: string
  ): Promise<GetGamePostResData | null> {
    try {
      const response: GetGamePostResData = await API.get(
        this.apiName,
        `${this.path}/game/${encodeURIComponent(game)}`,
        {}
      );
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getNextPostByGame(
    game: string,
    data: LastEvaluatedKey
  ): Promise<GetGamePostResData | null> {
    try {
      const path = `${this.path}/game/${encodeURIComponent(
        game
      )}/${encodeURIComponent(data.username)}/${encodeURIComponent(data.date)}`;
      const response: GetGamePostResData = await API.get(
        this.apiName,
        path,
        {}
      );
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getUserPost(
    username: string
  ): Promise<GetPostResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(username)}`;
      const response: GetPostResData = await API.get(this.apiName, path, {});
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getNextUserPost(
    data: LastEvaluatedKey
  ): Promise<GetPostResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(
        data.username
      )}/${encodeURIComponent(data.date)}`;
      const response: GetPostResData = await API.get(this.apiName, path, {});
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getUserPostByGame(
    username: string,
    game: string
  ): Promise<GetPostResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(
        username
      )}/game/${encodeURIComponent(game)}`;
      const response: GetPostResData = await API.get(this.apiName, path, {});
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static async getNextUserPostByGame(
    game: string,
    data: LastEvaluatedKey
  ): Promise<GetPostResData | null> {
    try {
      const path = `${this.path}/user/${encodeURIComponent(
        data.username
      )}/game/${encodeURIComponent(game)}/${encodeURIComponent(data.date)}`;
      const response: GetPostResData = await API.get(this.apiName, path, {});
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
