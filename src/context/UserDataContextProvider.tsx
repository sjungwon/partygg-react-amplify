import React, { createContext, useCallback, useState } from "react";
import AuthServices from "../services/AuthServices";
import ProfileServices from "../services/ProfileServices";
import UserServices from "../services/UserServices";
import { Profile } from "../types/profile.type";

interface UserDataContextType {
  username: string;
  setUsernameHandler: (username: string) => void;
  profileArr: Profile[];
  setProfileArrHandler: (profiles: Profile[]) => void;
  currentProfile: Profile;
  setCurrentProfileHandler: (profile: Profile) => void;
  filteredProfileArr: Profile[];
  setFilteredProfileHandler: (gameName: string) => void;
  checkLogin: () => void;
  logout: () => void;
}

interface Props {
  children: React.ReactNode;
}

const initialProfile = {
  username: "",
  date: "",
  nickname: "",
  game: "",
  profileImage: "",
};

export const UserDataContext = createContext<UserDataContextType>({
  username: "",
  setUsernameHandler: (username: string) => {},
  profileArr: [],
  setProfileArrHandler: (profiles: Profile[]) => {},
  currentProfile: {
    username: "",
    date: "",
    nickname: "",
    game: "",
    profileImage: "",
  },
  setCurrentProfileHandler: (profile: Profile) => {},
  filteredProfileArr: [],
  setFilteredProfileHandler: (gameName: string) => {},
  checkLogin: () => {},
  logout: () => {},
});

const UserDataContextProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState("");

  const setUsernameHandler = useCallback(
    (username: string) => setUsername(username),
    []
  );

  const [profileArr, setProfileArr] = useState<Profile[]>([]);

  const setProfileArrHandler = useCallback((profileArr: Profile[]) => {
    setProfileArr(profileArr);
  }, []);

  const [currentProfile, setCurrentProfile] = useState<Profile>(initialProfile);

  const setCurrentProfileHandler = useCallback((profile: Profile) => {
    setCurrentProfile(profile);
  }, []);

  const [filteredProfileArr, setFilteredProfileArr] = useState<Profile[]>([]);

  const setFilteredProfileHandler = useCallback(
    (gameName: string) => {
      console.log(gameName, profileArr);
      if (!username) {
        return;
      }
      if (!gameName) {
        setFilteredProfileArr(profileArr);
        if (profileArr.length) {
          setCurrentProfile(profileArr[0]);
        }
        return;
      }
      const filteredProfiles = profileArr.filter(
        (profile) => profile.game === gameName
      );
      setFilteredProfileArr(filteredProfiles);
      setCurrentProfile(
        filteredProfiles.length
          ? filteredProfiles[0]
          : {
              ...initialProfile,
              nickname: "게임 프로필을 추가해주세요.",
            }
      );
    },
    [profileArr, username]
  );

  const checkLogin = useCallback(async () => {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      console.log(username);
      if (username) {
        setUsername(username);
        const profiles = await ProfileServices.getProfiles();
        if (profiles && profiles.length) {
          setProfileArr(profiles);
          setFilteredProfileArr(profiles);
          setCurrentProfile(profiles[0]);
        } else {
          setCurrentProfile({
            ...initialProfile,
            nickname: "게임 프로필을 추가해주세요.",
          });
        }
      } else {
        setCurrentProfile({
          ...initialProfile,
          nickname: "로그인이 필요합니다.",
        });
      }
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthServices.signOut();
      setUsername("");
      setProfileArr([]);
      setFilteredProfileArr([]);
      setCurrentProfile({
        ...initialProfile,
        nickname: "로그인이 필요합니다.",
      });
    } catch {
      window.alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  }, []);

  console.log("context render");

  return (
    <UserDataContext.Provider
      value={{
        username,
        setUsernameHandler,
        profileArr,
        setProfileArrHandler,
        currentProfile,
        setCurrentProfileHandler,
        filteredProfileArr,
        setFilteredProfileHandler,
        checkLogin,
        logout,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContextProvider;
