import React, { createContext, useCallback, useEffect, useState } from "react";
import { GetProfilesResData, Profile } from "../types/profile.type";

interface UserDataContextType {
  username: string;
  setUsernameHandler: (username: string) => void;
  profileArr: Profile[];
  setProfileArrHandler: (profiles: Profile[]) => void;
  currentProfile: Profile;
  setCurrentProfileHandler: (profile: Profile) => void;
}

interface Props {
  children: React.ReactNode;
}

export const UserDataContext = createContext<UserDataContextType>({
  username: "",
  setUsernameHandler: (username: string) => {},
  profileArr: [],
  setProfileArrHandler: (profiles: GetProfilesResData) => {},
  currentProfile: {
    username: "",
    nickname: "",
    game: "",
    profileImage: "",
  },
  setCurrentProfileHandler: (profile: Profile) => {},
});

const UserDataContextProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState("");

  const setUsernameHandler = useCallback(
    (username: string) => setUsername(username),
    []
  );

  const [profileArr, setProfileArr] = useState<GetProfilesResData>([]);

  const setProfileArrHandler = useCallback((profileArr: Profile[]) => {
    setProfileArr(profileArr);
    setCurrentProfile(profileArr[0]);
  }, []);

  const [currentProfile, setCurrentProfile] = useState<Profile>({
    username: "",
    nickname: "",
    game: "",
    profileImage: "",
  });

  const setCurrentProfileHandler = useCallback(
    (profile: Profile) => setCurrentProfile(profile),
    []
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
