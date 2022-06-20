import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import FileServices from "../services/FileServices";
import { ImageKeys } from "../types/file.type";
import { Profile } from "../types/profile.type";
import styles from "./ProfileCard.module.scss";

interface PropsType {
  searchProfile?: Profile;
}

const initialProfile: Profile = {
  username: "",
  id: "",
  nickname: "",
  game: "",
  profileImage: undefined,
};

export default function ProfileCard({ searchProfile }: PropsType) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [image, setImage] = useState<string>("");

  const getProfileImage = useCallback(async (imageKey: ImageKeys) => {
    const image = await FileServices.getImage(imageKey, "fullsize");
    if (!image) {
      window.alert(
        "프로필 이미지를 가져오는 중에 오류가 발생했습니다. 다시 시도해주세요."
      );
      return;
    }
    setImage(image);
  }, []);

  useEffect(() => {
    if (searchProfile) {
      setProfile(searchProfile);
      if (searchProfile.profileImage) {
        getProfileImage(searchProfile.profileImage);
      }
    }
  }, [getProfileImage, searchProfile]);
  return (
    <Card className={styles.container}>
      <Card.Body className={styles.body_container}>
        <div className={styles.img_container}>
          <img
            src={image ? image : "/default_profile.png"}
            alt="프로필 이미지"
            className={styles.profile_img}
          />
        </div>
        <Card.Title className={styles.title}>
          닉네임: {profile.nickname}
        </Card.Title>
        <Card.Subtitle className={styles.subtitle}>
          사용자 이름:{" "}
          <NavLink
            to={`/usernames/${profile.username}`}
            className={styles.subtitle_link}
          >
            {profile.username}
          </NavLink>
        </Card.Subtitle>
        <Card.Subtitle className={styles.subtitle}>
          게임 :{" "}
          <NavLink
            to={`/games/${profile.game}`}
            className={styles.subtitle_link}
          >
            {profile.game}
          </NavLink>
        </Card.Subtitle>
      </Card.Body>
    </Card>
  );
}
