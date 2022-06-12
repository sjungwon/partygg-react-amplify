import { Profile } from "../types/profile.type";
import styles from "./ProfileBlock.module.scss";

interface PropsType {
  profile: Profile;
}

export default function ProfileBlock({ profile }: PropsType) {
  return (
    <>
      <img
        src={
          profile.profileImage ? profile.profileImage : "/default_profile.png"
        }
        className={styles.profile_img}
        alt="profile"
      />
      {profile.profileImage ? null : (
        <a
          href="https://www.flaticon.com/kr/free-icons/"
          title="사용자 아이콘"
          className={styles.profile_img_credit}
        >
          사용자 아이콘 제작자: Ongicon - Flaticon
        </a>
      )}
      <div className={styles.profile_nickname}>
        {profile.nickname}
        <span
          className={styles.profile_username}
        >{` (${profile.username})`}</span>
      </div>
    </>
  );
}
