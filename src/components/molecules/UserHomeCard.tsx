import { useCallback, useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { UserDataContext } from "../../context/UserDataContextProvider";
import sortProfiles from "../../functions/sortProfile";
import ProfileServices from "../../services/ProfileServices";
import { Profile } from "../../types/profile.type";
import ProfileList from "./ProfileList";
import styles from "./scss/UserHomeCard.module.scss";

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
    if (username === myUsername) {
      setUserProfile(profileArr);
      return;
    }
    getUserProfile(username);
  }, [getUserProfile, myUsername, profileArr, username]);

  return (
    <Card className={styles.container}>
      <Card.Header>
        <Card.Title className={styles.title}>{username}</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        {userProfile.length ? (
          <ProfileList profileArr={userProfile} username={username} />
        ) : (
          <>
            <p className={styles.no_user}>
              존재하지 않는 사용자 또는 사용자의 프로필 정보 없음
            </p>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
