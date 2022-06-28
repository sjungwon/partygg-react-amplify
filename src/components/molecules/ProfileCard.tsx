import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import useImgLoadError from "../../hooks/useImgLoadError";
import FileServices from "../../services/FileServices";
import { ImageKeys } from "../../types/file.type";
import { Profile } from "../../types/profile.type";
import ImageSlide from "./ImageSlide";
import styles from "./scss/ProfileCard.module.scss";

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
  const [credentialImage, setCredentialImage] = useState<string>("");

  const getImage = useCallback(
    async (
      imageKey: ImageKeys,
      errMessage: string,
      type: "profile" | "credential"
    ) => {
      const image = await FileServices.getImage(imageKey, "fullsize");
      if (!image) {
        //"프로필 이미지를 가져오는 중에 오류가 발생했습니다. 다시 시도해주세요."
        window.alert(errMessage);
        return;
      }
      if (type === "profile") {
        setImage(image);
      } else {
        setCredentialImage(image);
      }
    },
    []
  );

  useEffect(() => {
    console.log(searchProfile);
    if (searchProfile) {
      setProfile(searchProfile);
      if (searchProfile.profileImage) {
        getImage(
          searchProfile.profileImage,
          "프로필 이미지를 가져오는 중에 오류가 발생했습니다. 다시 시도해주세요.",
          "profile"
        );
      }
      if (searchProfile.credential) {
        getImage(
          searchProfile.credential,
          "인증 이미지를 가져오는 중에 오류가 발생했습니다. 다시 시도해주세요.",
          "credential"
        );
      }
    }
  }, [getImage, searchProfile]);

  const loadError = useImgLoadError();
  return (
    <Card className={styles.container}>
      <Card.Body className={styles.body_container}>
        <div className={styles.img_container}>
          <img
            src={image ? image : "/default_profile.png"}
            alt="프로필 이미지"
            className={styles.profile_img}
            onError={loadError}
          />
        </div>
        <Card.Title className={styles.title}>
          {profile.nickname !== "삭제된 프로필" ? "닉네임:" : ""}{" "}
          {profile.nickname}
        </Card.Title>
        <Card.Subtitle className={styles.subtitle}>
          사용자 이름:{" "}
          {profile.username ? (
            <NavLink
              to={`/usernames/${profile.username}`}
              className={styles.subtitle_link}
            >
              {profile.username}
            </NavLink>
          ) : null}
        </Card.Subtitle>
        <Card.Subtitle className={styles.subtitle}>
          게임 :{" "}
          {profile.game ? (
            <NavLink
              to={`/games/${profile.game}`}
              className={styles.subtitle_link}
            >
              {profile.game}
            </NavLink>
          ) : null}
        </Card.Subtitle>
        <div className={styles.credentials}>
          <p className={styles.credentials_text}>인증 정보</p>
          {credentialImage ? (
            <ImageSlide images={[credentialImage]} expandable noIndicator />
          ) : (
            <p className={styles.credentials_text}>없음</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
