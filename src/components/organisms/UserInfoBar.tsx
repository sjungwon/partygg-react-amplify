import { useContext } from "react";
import { UserDataContext } from "../../context/UserDataContextProvider";
import styles from "./scss/UserInfoBar.module.scss";
import ProfileList from "../molecules/ProfileList";

export default function UserInfoBar() {
  const { username, profileArr } = useContext(UserDataContext);

  return (
    <div className={styles.container}>
      <ProfileList username={username} profileArr={profileArr} />
    </div>
  );
}
