export interface TokenRefreshResData {
  username: string;
  token: string;
  error: Error | null;
}

export interface ProfilePostReqData {
  nickname: string;
  game: string;
  profileImage: string;
}

export interface ProfilesGetResData {
  username: string;
  nickname: string;
  game: string;
  profileImage: string;
}
