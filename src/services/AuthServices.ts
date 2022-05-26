import { Auth } from "aws-amplify";
import {
  ConfirmSignUpReqData,
  SignInReqData,
  SignUpReqData,
} from "../types/auth.type";

export default class AuthServices {
  public static async signUp(data: SignUpReqData) {
    await Auth.signUp(data);
  }

  public static async confirmSignUp(
    data: ConfirmSignUpReqData
  ): Promise<boolean> {
    try {
      const response = await Auth.confirmSignUp(data.username, data.code);
      console.log(response);
      return true;
    } catch (error: any) {
      console.log(error.message);
      if (error.message.includes("Current status is CONFIRMED")) {
        return true;
      }
      return false;
    }
  }

  public static async resendConfirmationCode(username: string) {
    await Auth.resendSignUp(username);
  }

  public static async signIn(data: SignInReqData) {
    await Auth.signIn(data.username, data.password);
  }

  public static async signOut() {
    await Auth.signOut();
  }
}
