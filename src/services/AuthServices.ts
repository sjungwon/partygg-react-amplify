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
      await Auth.confirmSignUp(data.username, data.code);
      return true;
    } catch (error: any) {
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

  public static async findPassword(username: string) {
    await Auth.forgotPassword(username);
  }

  public static async findPasswordSubmit(
    username: string,
    code: string,
    new_password: string
  ) {
    await Auth.forgotPasswordSubmit(username, code, new_password);
  }
}
