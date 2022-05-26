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
  checkLogin: () => void;
  logout: () => void;
}

interface Props {
  children: React.ReactNode;
}

export const UserDataContext = createContext<UserDataContextType>({
  username: "",
  setUsernameHandler: (username: string) => {},
  profileArr: [],
  setProfileArrHandler: (profiles: Profile[]) => {},
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

  const checkLogin = useCallback(async () => {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      if (username) {
        setUsername(username);
        const profiles = await ProfileServices.getProfiles();
        if (profiles) {
          setProfileArr(profiles);
        }
      }
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthServices.signOut();
      setUsername("");
      setProfileArr([]);
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
        checkLogin,
        logout,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContextProvider;
