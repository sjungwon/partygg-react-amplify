export interface SignBasicType {
  username: string;
  password: string;
}

export interface SignUpReqData extends SignBasicType {
  attributes: {
    email: string;
  };
}

export interface ConfirmSignUpReqData {
  username: string;
  code: string;
}

export interface SignInReqData extends SignBasicType {}
