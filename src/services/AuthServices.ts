import { Auth } from "aws-amplify";
import {
  ConfirmSignUpReqData,
  SignInReqData,
  SignUpReqData,
} from "../types/AuthServices.type";

export default class AuthServices {
  public static async signUp(data: SignUpReqData) {
    await Auth.signUp(data);
  }

  public static async confirmSignUp(data: ConfirmSignUpReqData) {
    await Auth.confirmSignUp(data.username, data.code);
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
