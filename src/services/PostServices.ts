import { API } from "aws-amplify";
import { AddPostReqData, RemovePostReqData } from "../types/post.type";
import UserServices from "./UserServices";

export default class PostServices {
  private static apiName: string = "partyggApi";
  private static path: string = "/posts";
  public static async addPost(newPost: AddPostReqData) {
    try {
      await UserServices.getUsernameWithRefresh();
      const myInit: { body: AddPostReqData } = {
        body: newPost,
      };
      const response = await API.post(this.apiName, this.path, myInit);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  public static async getPostByGame(game: string) {
    try {
      await UserServices.getUsernameWithRefresh();
      const response = await API.get(
        this.apiName,
        `${this.path}/${encodeURIComponent(game)}`,
        {}
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  public static async removePost(data: RemovePostReqData) {
    try {
      await UserServices.getUsernameWithRefresh();
      const response = await API.del(
        this.apiName,
        `${this.path}/object/${encodeURIComponent(
          data.game
        )}/${encodeURIComponent(data.date)}`,
        {}
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
