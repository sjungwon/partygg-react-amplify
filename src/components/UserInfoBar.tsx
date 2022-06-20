import { useContext } from "react";
import { UserDataContext } from "../context/UserDataContextProvider";
import styles from "./UserInfoBar.module.scss";
import ProfileList from "./ProfileList";

export default function UserInfoBar() {
  const { username, profileArr } = useContext(UserDataContext);

  return (
    <div className={styles.container}>
      <ProfileList username={username} profileArr={profileArr} />
    </div>
  );
}
