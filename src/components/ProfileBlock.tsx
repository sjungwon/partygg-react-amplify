import useImgLoadError from "../hooks/useImgLoadError";
import useProfileImage from "../hooks/useProfileImage";
import { Profile } from "../types/profile.type";
import styles from "./ProfileBlock.module.scss";

interface PropsType {
  profile: Profile;
  hideUsername?: true;
}

export default function ProfileBlock({ profile, hideUsername }: PropsType) {
  const profileImage = useProfileImage(profile.profileImage);

  const loadError = useImgLoadError();

  return (
    <>
      <img
        src={profileImage ? profileImage : "/default_profile.png"}
        className={styles.profile_img}
        alt="profile"
        onError={loadError}
      />
      <div className={styles.profile_nickname}>
        {profile.nickname}
        {hideUsername ? null : (
          <span
            className={styles.profile_username}
          >{` (${profile.username})`}</span>
        )}
      </div>
    </>
  );
}
