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

export interface ProfileData {
  username: string;
  nickname: string;
  game: string;
  profileImage: string;
}

export type ProfilesGetResData = ProfileData[];
