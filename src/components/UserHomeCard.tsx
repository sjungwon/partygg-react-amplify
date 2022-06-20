import { useCallback, useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { UserDataContext } from "../context/UserDataContextProvider";
import sortProfiles from "../Functions/sortProfile";
import ProfileServices from "../services/ProfileServices";
import { Profile } from "../types/profile.type";
import ProfileList from "./ProfileList";
import styles from "./UserHomeCard.module.scss";

interface PropsType {
  username: string;
}

export default function UserHomeCard({ username }: PropsType) {
  const [userProfile, setUserProfile] = useState<Profile[]>([]);
  const { profileArr, username: myUsername } = useContext(UserDataContext);

  const getUserProfile = useCallback(async (username: string) => {
    if (!username) {
      return;
    }
    const profile = await ProfileServices.getProfiles(username);
    if (!profile) {
      window.alert(
        "프로필을 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
      );
      return;
    }
    setUserProfile(sortProfiles(profile));
  }, []);

  useEffect(() => {
    console.log(username, myUsername);
    if (username === myUsername) {
      setUserProfile(profileArr);
      return;
    }
    getUserProfile(username);
  }, [getUserProfile, myUsername, profileArr, username]);

  return (
    <Card className={styles.container}>
      <Card.Header className={styles.title_container}>
        <Card.Title className={styles.title}>{username}</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        <ProfileList profileArr={userProfile} username={username} />
      </Card.Body>
    </Card>
  );
}
