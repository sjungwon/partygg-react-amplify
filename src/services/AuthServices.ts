import { Auth } from "aws-amplify";
import {
  ConfirmSignUpReqData,
  SignInReqData,
  SignUpReqData,
} from "../types/AuthServices.type";

export default class AuthServices {
  public static async signUp(data: SignUpReqData) {
    const response = await Auth.signUp(data);
    console.log(response);
    return response;
  }

  public static async confirmSignUp(data: ConfirmSignUpReqData) {
    Auth.confirmSignUp(data.username, data.code);
  }

  public static async signIn(data: SignInReqData) {
    const user = await Auth.signIn(data.username, data.password);
    console.log(user);
    return user;
  }
}
