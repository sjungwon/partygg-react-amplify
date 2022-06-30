import { ReactNode } from "react";
import useImgLoadError from "../../hooks/useImgLoadError";
import useProfileImage from "../../hooks/useProfileImage";
import { Profile } from "../../types/profile.type";
import NavLinkBlock from "../atoms/NavLinkBlock";
import styles from "./scss/ProfileBlock.module.scss";

interface PropsType {
  children?: ReactNode;
  profile: Profile;
  hideUsername?: true;
  disableNavigate?: true;
  size?: "md" | "lg";
}

export default function ProfileBlock({
  profile,
  hideUsername,
  disableNavigate,
  children,
  size = "md",
}: PropsType) {
  const profileImage = useProfileImage(profile.profileImage);

  const loadError = useImgLoadError();

  if (disableNavigate) {
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
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <NavLinkBlock to={`/profiles/${profile.id}`}>
        <img
          src={profileImage ? profileImage : "/default_profile.png"}
          className={`${styles.profile_img} ${
            size === "lg" ? styles.profile_img_lg : ""
          }`}
          alt="profile"
          onError={loadError}
        />
      </NavLinkBlock>
      <NavLinkBlock to={`/profiles/${profile.id}`}>
        <div
          className={`${styles.profile_nickname} ${
            size === "lg" ? styles.profile_nickname_lg : ""
          }`}
        >
          {profile.nickname}
          {hideUsername ? null : (
            <span
              className={styles.profile_username}
            >{` (${profile.username})`}</span>
          )}
        </div>
        {children}
      </NavLinkBlock>
    </>
  );
}
