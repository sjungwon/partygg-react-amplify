import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import styles from "./scss/AddPostElement.module.scss";
import ProfileSelector from "../atoms/ProfileSelector";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { AddPostReqData, Post } from "../../types/post.type";
import { Profile } from "../../types/profile.type";
import useProfileImage from "../../hooks/useProfileImage";
import useImgLoadError from "../../hooks/useImgLoadError";
import { addImageResData, ImageKeys } from "../../types/file.type";
import FileServices from "../../services/FileServices";
import PostServices from "../../services/PostServices";
import DefaultButton from "../atoms/DefaultButton";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import DefaultTextarea from "../atoms/DefaultTextarea";
import LoadingBlock from "../atoms/LoadingBlock";
import AddPostImageModal from "./AddPostImageModal";
import ImageSlide from "./ImageSlide";
import ProfileList from "./ProfileList";
import { PostListContext } from "../../pages/HomePage";

interface Props {
  prevData?: {
    setMode: (mode: "" | "modify") => void;
    postData: Post;
    imageURLs: string[];
  };
}

//prevData에 따라 수정, 추가 상태 결정
export default function AddPostElement({ prevData }: Props) {
  //프로필 데이터 사용
  const {
    username,
    filteredProfileArr,
    profileArr,
    currentProfile: defaultProfile,
  } = useContext(UserDataContext);

  //prevData 유무에 따라 form을 바로 보여줄 지 결정
  const [show, setShow] = useState(!!prevData);

  //form 열고 닫는 함수
  const showHandler = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setShow(false);
  }, []);

  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);
  const [filteredProfile, setFilteredProfile] =
    useState<Profile[]>(filteredProfileArr);
  const profileImage = useProfileImage(currentProfile.profileImage);
  const loadError = useImgLoadError();

  //prevData가 있으면 해당 데이터의 프로필로 현재 프로필 변경, 없으면 첫번째 프로필로 설정
  useEffect(() => {
    if (prevData) {
      const filtered = profileArr.filter(
        (profile) => profile.game === prevData?.postData.game
      );
      setFilteredProfile(filtered);
      const finded = profileArr.find(
        (profile) => profile.id === prevData?.postData.profileId
      );
      setCurrentProfile(finded ? finded : filtered[0]);

      return;
    }
    setCurrentProfile(defaultProfile);
  }, [defaultProfile, filteredProfileArr, prevData, profileArr]);

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && filteredProfileArr.length) {
        setCurrentProfile(filteredProfileArr[parseInt(eventKey)]);
      }
    },
    [filteredProfileArr, setCurrentProfile]
  );

  return (
    <Card className={styles.card}>
      <div className={username ? "" : styles.disabled}>
        {prevData ? null : (
          <Card.Header className={styles.card_header}>
            <Card.Title className={styles.card_header_title}>
              유저 메뉴
            </Card.Title>
            <ProfileList username={username} profileArr={filteredProfileArr} />
          </Card.Header>
        )}
        <Card.Body>
          <div className={styles.card_body}>
            <img
              src={profileImage ? profileImage : "/default_profile.png"}
              className={styles.card_body_img}
              alt="profile"
              onError={loadError}
            />
            <Card.Title className={styles.card_body_title}>
              {currentProfile.nickname ? currentProfile.nickname : ""}
            </Card.Title>
            <div className={styles.card_body_right}>
              <ProfileSelector
                profileArr={prevData ? filteredProfile : filteredProfileArr}
                size="sm"
                onSelect={select}
              />
            </div>
          </div>
          {prevData ? null : (
            <DefaultButton
              size="xl"
              onClick={showHandler}
              className={styles.card_body_btn}
              disabled={!username || !filteredProfileArr.length}
            >
              포스트 작성
            </DefaultButton>
          )}
        </Card.Body>
        <PostForm
          show={show}
          close={close}
          prevData={prevData}
          currentProfile={currentProfile}
        />
      </div>
    </Card>
  );
}

interface FormPropsType {
  show: boolean;
  close: () => void;
  currentProfile: Profile;
  prevData?: {
    setMode: (mode: "" | "modify") => void;
    postData: Post;
    imageURLs: string[];
  };
}

function PostForm({ show, close, currentProfile, prevData }: FormPropsType) {
  const { modifyPost, addPost } = useContext(PostListContext);
  //기본 form 데이터 -> 이미지, 텍스트, 프로필
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);

  //사진 모달 관련 데이터, 함수
  const [mdShow, setMdShow] = useState<boolean>(false);
  const openMd = () => {
    setMdShow(true);
  };

  const closeMd = () => {
    setMdShow(false);
  };

  const cancleModify = useCallback(() => {
    if (prevData) {
      prevData.setMode("");
    }
    close();
  }, [close, prevData]);

  const [postImageKeys, setPostImageKeys] = useState<ImageKeys[]>([]);

  useEffect(() => {
    if (prevData) {
      setPostImageKeys(prevData.postData.images);
      if (prevData.imageURLs.length) {
        setImages(prevData.imageURLs);
      }
    }
  }, [prevData]);

  const [loading, setLoading] = useState<boolean>(false);

  //제출 버튼 눌렀을 때 사용할 함수
  const submit = useCallback(async () => {
    const text = textRef?.current?.value.trim();
    if (text || images.length) {
      setLoading(true);
      const data = {
        text: text ? text : "",
        profile: currentProfile,
        game: currentProfile.game,
      };
      //포스트 수정
      if (prevData) {
        let newData: Post = {
          ...prevData.postData,
          ...data,
        };
        if (files) {
          const imageKeys = await Promise.all(
            files.map(async (file) => {
              const key = await FileServices.putPostImage(file);
              return key;
            })
          );

          if (imageKeys.includes(null)) {
            window.alert(
              "포스트를 수정중에 오류가 발생했습니다. 다시 시도해주세요."
            );
            setLoading(false);
            return;
          }

          newData = {
            ...newData,
            images: [...postImageKeys, ...(imageKeys as addImageResData[])],
          };
        }
        const success = await PostServices.updatePost(newData);
        if (!success) {
          window.alert(
            "포스트를 수정하는데 오류가 발생했습니다. 다시 시도해주세요."
          );
          setLoading(false);
          return;
        }

        modifyPost(newData);
        prevData.setMode("");
      } else {
        //post 추가
        let newData: AddPostReqData = {
          ...data,
          profileId: data.profile.id,
          images: [],
        };
        if (files) {
          const imageKey = await Promise.all(
            files.map(async (file) => {
              const key = await FileServices.putPostImage(file);
              return key;
            })
          );
          if (imageKey.includes(null)) {
            Promise.all(
              imageKey.map(async (keys) => {
                if (keys) {
                  await FileServices.removeImage(keys);
                }
              })
            );
            window.alert(
              "포스트를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
            );
            setLoading(false);
            return;
          }
          newData = {
            ...newData,
            images: imageKey as addImageResData[],
          };
        }
        const post = await PostServices.addPost(newData);
        if (!post) {
          window.alert(
            "포스트를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
          );
          setLoading(false);
          return;
        }
        addPost(post);
      }
      setLoading(false);
      setImages([]);
      setFiles([]);
      if (textRef.current) {
        textRef.current.value = "";
      }
      close();
    }
  }, [
    addPost,
    close,
    currentProfile,
    files,
    images.length,
    modifyPost,
    postImageKeys,
    prevData,
  ]);

  if (!show) {
    return null;
  }

  return (
    <>
      <Card.Footer className={styles.card_footer}>
        <div className={styles.card_footer_btns}>
          <DefaultButton size="sq_md" onClick={openMd}>
            <MdOutlinePhotoSizeSelectActual />
          </DefaultButton>
          <AddPostImageModal
            mdShow={mdShow}
            closeMd={closeMd}
            postImages={images}
            setPostImage={setImages}
            setPostFiles={setFiles}
            postImageKeys={postImageKeys}
            setPostImageKeys={setPostImageKeys}
          />
        </div>
        {images.length ? <ImageSlide images={images} /> : null}
        <DefaultTextarea
          defaultValue={prevData?.postData.text}
          ref={textRef}
          size="lg"
        />
        <div className={styles.card_footer_bottom_btns}>
          <DefaultButton
            onClick={submit}
            size="md"
            disabled={loading}
            className={styles.btn_margin}
          >
            <LoadingBlock loading={loading}>등록</LoadingBlock>
          </DefaultButton>
          <DefaultButton onClick={cancleModify} size="md" disabled={loading}>
            취소
          </DefaultButton>
        </div>
      </Card.Footer>
    </>
  );
}
