import React, { createContext, useCallback, useEffect, useState } from "react";
import { ProfileData, ProfilesGetResData } from "../types/UserServices.type";

interface UserDataContextType {
  username: string;
  setUsernameHandler: (username: string) => void;
  profileArr: ProfilesGetResData;
  setProfileArrHandler: (profile: ProfilesGetResData) => void;
  currentProfile: ProfileData;
  setCurrentProfileHandler: (index: number) => void;
}

interface Props {
  children: React.ReactNode;
}

export const UserDataContext = createContext<UserDataContextType>({
  username: "",
  setUsernameHandler: (username: string) => {},
  profileArr: [],
  setProfileArrHandler: (profile: ProfilesGetResData) => {},
  currentProfile: {
    username: "",
    nickname: "",
    game: "",
    profileImage: "",
  },
  setCurrentProfileHandler: (index: number) => {},
});

const UserDataContextProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState("");

  const setUsernameHandler = useCallback(
    (username: string) => setUsername(username),
    []
  );

  const [profileArr, setProfileArr] = useState<ProfilesGetResData>([]);

  const setProfileArrHandler = useCallback((profileArr: ProfilesGetResData) => {
    setProfileArr(profileArr);
    setCurrentProfile(profileArr[0]);
  }, []);

  const [currentProfile, setCurrentProfile] = useState<ProfileData>({
    username: "",
    nickname: "",
    game: "",
    profileImage: "",
  });

  const setCurrentProfileHandler = useCallback(
    (index: number) => setCurrentProfile(profileArr[index]),
    [profileArr]
  );

  console.log("context render");

  useEffect(() => {}, []);

  return (
    <UserDataContext.Provider
      value={{
        username,
        setUsernameHandler,
        profileArr,
        setProfileArrHandler,
        currentProfile,
        setCurrentProfileHandler,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContextProvider;
