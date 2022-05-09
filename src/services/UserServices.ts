import { Auth } from "aws-amplify";

export default class UserServices {
  public static async getUser() {
    return await Auth.currentAuthenticatedUser();
  }
}
