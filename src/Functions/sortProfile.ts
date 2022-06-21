import { Profile } from "../types/profile.type";

const sortProfiles = (profileArr: Profile[]) => {
  const sortedProfile = [...profileArr].sort((a, b) => {
    if (a.game > b.game) {
      return 1;
    } else if (a.game < b.game) {
      return -1;
    } else {
      console.log(a, b);
      if (a.nickname < b.nickname) {
        return -1;
      } else if (a.nickname > b.nickname) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  return [...sortedProfile];
};

export default sortProfiles;
