import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import styles from "./AddPostElement.module.scss";
// import PostForm from "./PostForm";
import { BsPlusLg } from "react-icons/bs";
import ProfileSelector from "../ProfileSelector";
import { UserDataContext } from "../../context/UserDataContextProvider";
import PostForm from "./PostForm";
import { Post } from "../../types/post.type";
import { Profile } from "../../types/profile.type";
import useProfileImage from "../../hooks/useProfileImage";
import useImgLoadError from "../../hooks/useImgLoadError";

interface Props {
  prevData: {
    setMode?: (mode: "" | "modify") => void;
    postData?: Post;
    setPostData: (newPost: any) => void;
    imageURLs?: string[];
  };
}

//prevData에 따라 수정, 추가 상태 결정
export default function AddPostElement({ prevData }: Props) {
  //프로필 데이터 사용
  const { filteredProfileArr, currentProfile: defaultProfile } =
    useContext(UserDataContext);
  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);
  //prevData가 있으면 해당 데이터의 프로필로 현재 프로필 변경, 없으면 첫번째 프로필로 설정
  useEffect(() => {
    if (prevData.postData) {
      const profile = filteredProfileArr.find(
        (profile) => profile.nickname === prevData.postData?.profile.nickname
      );
      setCurrentProfile(profile ? profile : filteredProfileArr[0]);
      return;
    }
    setCurrentProfile(defaultProfile);
  }, [defaultProfile, filteredProfileArr, prevData]);

  //prevData 유무에 따라 form을 바로 보여줄 지 결정
  const [show, setShow] = useState(!!prevData.setMode);

  //form 열고 닫는 함수
  const showHandler = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setShow(false);
  }, []);

  const profileImage = useProfileImage(currentProfile.profileImage);
  const loadError = useImgLoadError();
  return (
    <Card className={styles.card}>
      <Card.Header className={styles.card_header}>
        <img
          src={profileImage ? profileImage : "/default_profile.png"}
          className={styles.card_header_img}
          alt="profile"
          onError={loadError}
        />
        <Card.Title className={styles.card_header_title}>
          {currentProfile.nickname ? currentProfile.nickname : ""}
        </Card.Title>
        <div className={styles.card_header_right}>
          <ProfileSelector setCurrentProfile={setCurrentProfile} size="sm" />
          <Button
            onClick={showHandler}
            size="sm"
            disabled={!filteredProfileArr.length}
          >
            <BsPlusLg />
          </Button>
        </div>
      </Card.Header>
      <PostForm
        show={show}
        close={close}
        prevData={prevData}
        currentProfile={currentProfile}
      />
    </Card>
  );
}
