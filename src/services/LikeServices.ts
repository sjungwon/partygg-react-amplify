import { API } from "aws-amplify";
import UserServices from "./UserServices";

export default class LikeServices {
  private static apiName: string = "partyggApi";
  private static likePath: string = "/likes";
  private static dislikePath: string = "/dislikes";

  public static async postLike(postId: string): Promise<boolean> {
    const { username } = await UserServices.getUsernameWithRefresh();
    if (!username) {
      return false;
    }
    try {
      const myInit = {
        body: {
          username,
          postId,
        },
      };
      const response = await API.post(this.apiName, this.likePath, myInit);
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async postLikeRemove(postId: string): Promise<boolean> {
    const { username } = await UserServices.getUsernameWithRefresh();
    if (!username) {
      return false;
    }
    const path = `${this.likePath}/object/${encodeURIComponent(
      postId
    )}/${encodeURIComponent(username)}`;
    try {
      const response = await API.del(this.apiName, path, {});
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async postDislike(postId: string): Promise<boolean> {
    const { username } = await UserServices.getUsernameWithRefresh();
    if (!username) {
      return false;
    }
    try {
      const myInit = {
        body: {
          username,
          postId,
        },
      };
      const response = await API.post(this.apiName, this.dislikePath, myInit);
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async postDislikeRemove(postId: string): Promise<boolean> {
    const { username } = await UserServices.getUsernameWithRefresh();
    if (!username) {
      return false;
    }
    const path = `${this.dislikePath}/object/${encodeURIComponent(
      postId
    )}/${encodeURIComponent(username)}`;
    try {
      const response = await API.del(this.apiName, path, {});
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
