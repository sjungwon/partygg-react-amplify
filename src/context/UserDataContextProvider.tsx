import React, { createContext, useCallback, useState } from "react";
import sortProfiles from "../Functions/sortProfile";
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
  setFilteredProfileHandlerByProfile: (profileId: string) => void;
  updateProfileHandler: (
    profile: Profile,
    type: "add" | "modify" | "remove"
  ) => void;
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
  currentProfile: {
    username: "",
    id: "",
    nickname: "",
    game: "",
    profileImage: undefined,
  },
  setCurrentProfileHandler: (profile: Profile) => {},
  filteredProfileArr: [],
  setFilteredProfileHandler: (gameName: string) => {},
  setFilteredProfileHandlerByProfile: (profileId: string) => {},
  updateProfileHandler: (
    profile: Profile,
    type: "add" | "modify" | "remove"
  ) => {},
  checkLogin: () => {},
  logout: () => {},
});

const initialProfile: Profile = {
  username: "",
  id: "",
  nickname: "",
  game: "",
  profileImage: undefined,
};

// const sortProfiles = (profileArr: Profile[]) => {
//   const sortedProfile = [...profileArr].sort((a, b) => {
//     if (a.game > b.game) {
//       return 1;
//     } else if (a.game < b.game) {
//       return -1;
//     } else {
//       console.log(a, b);
//       if (a.nickname < b.nickname) {
//         return -1;
//       } else if (a.nickname > b.nickname) {
//         return 1;
//       } else {
//         return 0;
//       }
//     }
//   });
//   return [...sortedProfile];
// };

const UserDataContextProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState("");

  const setUsernameHandler = useCallback(
    (username: string) => setUsername(username),
    []
  );

  const [profileArr, setProfileArr] = useState<Profile[]>([]);

  const setProfileArrHandler = useCallback((profileArr: Profile[]) => {
    setProfileArr(sortProfiles(profileArr));
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

  const setFilteredProfileHandlerByProfile = useCallback(
    (profileId: string) => {
      const profile = profileArr.find((profile) => profile.id === profileId);
      if (profile) {
        setFilteredProfileArr([{ ...profile }]);
        setCurrentProfile({ ...profile });
      }
    },
    [profileArr]
  );

  const updateProfileHandler = useCallback(
    (profile: Profile, type: "add" | "modify" | "remove") => {
      if (type === "add") {
        setProfileArr((prev) => sortProfiles([profile, ...prev]));
        if (
          filteredProfileArr.length &&
          filteredProfileArr[0].game === profile.game
        ) {
          setFilteredProfileArr((prev) => sortProfiles([profile, ...prev]));
        }
        return;
      } else if (type === "modify") {
        setProfileArr((prev) =>
          sortProfiles(
            prev.map((prevProfile) => {
              if (prevProfile.id === profile.id) {
                return profile;
              }

              return prevProfile;
            })
          )
        );
        if (
          filteredProfileArr.length &&
          filteredProfileArr[0].game === profile.game
        ) {
          setFilteredProfileArr((prev) =>
            sortProfiles(
              prev.map((prevProfile) => {
                if (prevProfile.id === profile.id) {
                  return profile;
                }

                return prevProfile;
              })
            )
          );
        }
      } else {
        setProfileArr((prev) =>
          sortProfiles(
            prev.filter((prevProfile) => prevProfile.id !== profile.id)
          )
        );
        if (
          filteredProfileArr.length &&
          filteredProfileArr[0].game === profile.game
        ) {
          setFilteredProfileArr((prev) =>
            sortProfiles(
              prev.filter((prevProfile) => prevProfile.id !== profile.id)
            )
          );
        }
      }
    },
    [filteredProfileArr]
  );

  const checkLogin = useCallback(async () => {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      console.log(username);
      if (username) {
        setUsername(username);
        const profiles = await ProfileServices.getProfiles();
        if (profiles && profiles.length) {
          const sortedProfile = sortProfiles(profiles);
          setProfileArr(sortProfiles([...sortedProfile]));
          setFilteredProfileArr(sortProfiles([...sortedProfile]));
          setCurrentProfile(sortedProfile[0]);
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
        setFilteredProfileHandlerByProfile,
        updateProfileHandler,
        checkLogin,
        logout,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContextProvider;
