import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, CloseButton } from "react-bootstrap";
import styles from "./PostForm.module.scss";
import ImageSlide from "../ImageSlide";
import AddImageModal from "../AddImageModal";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import PostServices from "../../services/PostServices";
import { Profile } from "../../types/profile.type";
import { initialUpdatePost, UpdatePost } from "./PostList";
import FileServices from "../../services/FileServices";
import { addImageResData, ImageKeys } from "../../types/file.type";
import { AddPostReqData, Post } from "../../types/post.type";

interface PropsType {
  close: () => void;
  updatePost: UpdatePost;
  setUpdatePost: (data: any) => void;
  currentProfile: Profile;
}

export default function PostForm({
  close,
  updatePost,
  setUpdatePost,
  currentProfile,
}: PropsType) {
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

  //text 관련 데이터
  const [currentTextByte, setCurrentTextByte] = useState<number>(0);

  //post를 수정하는 경우에도 사용 -> 이전 데이터가 있으면
  //즉 수정하는 경우면 이전 데이터를 렌더에 설정

  //post 문자열 데이터 크기 측정에 사용하는 함수
  const calcByte = useCallback((value: string) => {
    const textByte = value
      .split("")
      .map((s) => s.charCodeAt(0))
      .reduce((prev, c) => prev + (c === 10 ? 2 : c >> 7 ? 2 : 1), 0);

    return textByte;
  }, []);

  //현재 입력되는 문자열 데이터의 크기를 측정
  //제한된 크기인 500바이트를 넘어가면 입력 무시함
  const calcCurrentByte = useCallback(
    (event: any) => {
      const textArea = event.target as HTMLTextAreaElement;
      const value = textArea.value;

      const textByte = calcByte(value);

      if (textByte > 500) {
        const over = textByte - 500;
        let index = value.length - 1;
        const findArray = value.split("").map((s) => s.charCodeAt(0));
        let count = 0;
        for (let i = value.length - 1; i >= 0; i--) {
          index = i;
          const cur = findArray[i];
          count += cur === 10 ? 2 : cur >> 7 ? 2 : 1;
          if (count >= over) {
            break;
          }
        }
        textArea.value = value.slice(0, index);
        setCurrentTextByte(500);
      } else {
        setCurrentTextByte(textByte);
      }
    },
    [calcByte]
  );

  const cancleModify = useCallback(() => {
    if (updatePost.postData) {
      setUpdatePost(initialUpdatePost);
    }
  }, [updatePost, setUpdatePost]);

  const getImageAsync = useCallback(async (imageKeys: ImageKeys[]) => {
    if (imageKeys.length && imageKeys[0].resizedKey.includes("http")) {
      const prevImage = imageKeys.map((imageKey) => imageKey.resizedKey);
      setImages(prevImage);
      return;
    }

    const imageURLArr = await Promise.all(
      imageKeys.map(async (imageKey) => {
        return await FileServices.getImage(imageKey, "resized");
      })
    );
    const filteredURL = imageURLArr.map((imageURL) =>
      imageURL ? imageURL : ""
    );
    setImages(filteredURL);
  }, []);

  useEffect(() => {
    if (updatePost.postData) {
      const imageKeys = updatePost.postData.images;
      if (imageKeys.length) {
        getImageAsync(imageKeys);
      }
      setCurrentTextByte(calcByte(updatePost.postData.text));
    }
  }, [calcByte, getImageAsync, updatePost.postData]);

  const [loading, setLoading] = useState<boolean>(false);

  //제출 버튼 눌렀을 때 사용할 함수
  const submit = useCallback(async () => {
    const text = textRef?.current?.value;
    if (text || images.length) {
      setLoading(true);
      const data = {
        text: text ? text : "",
        profile: currentProfile,
        game: currentProfile.game,
      };
      //포스트 수정
      if (updatePost.postData) {
        const prevData = { ...updatePost.postData };
        let newData: Post = {
          ...updatePost.postData,
          ...data,
        };
        if (files) {
          const tempImages: ImageKeys[] = images.map((url) => ({
            fullsizeKey: url,
            resizedKey: url,
          }));
          const uiData: Post = {
            ...newData,
            images: tempImages,
          };
          setUpdatePost((prev: UpdatePost) => ({
            ...prev,
            postData: uiData,
            success: true,
            type: "update",
          }));
          Promise.all(
            files.map(async (file) => {
              const key = await FileServices.putPostImage(file);
              return key;
            })
          ).then((imageKeys) => {
            //이미지 추가에 오류가 발생한 경우
            if (imageKeys.includes(null)) {
              window.alert("포스트를 수정중에 오류가 발생했습니다.");
              setUpdatePost((prev: UpdatePost) => ({
                ...prev,
                postData: prevData,
                success: true,
                type: "update",
              }));
            } else {
              //이미지 추가가 정상적으로 동작한 경우
              newData = {
                ...newData,
                images: [
                  ...prevData.images,
                  ...(imageKeys as addImageResData[]),
                ],
              };
              PostServices.updatePost(newData).then((success) => {
                if (!success) {
                  window.alert(
                    "포스트를 수정하는데 오류가 발생했습니다. 다시 시도해주세요."
                  );
                  setUpdatePost((prev: UpdatePost) => ({
                    ...prev,
                    postData: prevData,
                    success: true,
                    type: "update",
                  }));
                }
              });
            }
          });
        }
        PostServices.updatePost(newData).then((success) => {
          if (!success) {
            window.alert(
              "포스트를 수정하는데 오류가 발생했습니다. 다시 시도해주세요."
            );
            setUpdatePost((prev: UpdatePost) => ({
              ...prev,
              postData: prevData,
              success: true,
              type: "update",
            }));
          }
        });
      } else {
        //post 추가
        let newData: AddPostReqData = {
          ...data,
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
            return;
          }
          newData = {
            ...data,
            images: imageKey as addImageResData[],
          };
        }
        const post = await PostServices.addPost(newData);
        if (!post) {
          window.alert(
            "포스트를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
          );
          return;
        }
        const tempImages: ImageKeys[] = images.map((url) => ({
          fullsizeKey: url,
          resizedKey: url,
        }));
        const uiPost = {
          ...post,
          images: tempImages,
        };
        setUpdatePost(
          (prev: UpdatePost): UpdatePost => ({
            ...prev,
            postData: uiPost,
            success: true,
            type: "add",
          })
        );
      }
      close();
    }
  }, [
    close,
    currentProfile,
    files,
    images,
    setUpdatePost,
    updatePost.postData,
  ]);

  return (
    <>
      <Card.Body className={styles.card_body}>
        <div className={styles.card_body_btns}>
          <button onClick={openMd} className={styles.item_btn}>
            <MdOutlinePhotoSizeSelectActual />
          </button>
          <AddImageModal
            mdShow={mdShow}
            closeMd={closeMd}
            postImages={images}
            setPostImage={setImages}
            setPostFiles={setFiles}
          />
          {updatePost.postData ? null : <CloseButton onClick={close} />}
        </div>
        {images.length ? <ImageSlide images={images} /> : null}
        <textarea
          className={styles.card_body_textarea}
          ref={textRef}
          autoFocus
          onChange={calcCurrentByte}
          placeholder="500Byte 이하로 작성 가능합니다."
          defaultValue={updatePost.postData ? updatePost.postData.text : ""}
        />
        <div className={styles.card_body_textarea_length}>
          <span className={styles.card_body_textarea_cur}>
            {currentTextByte + " Byte / "}
          </span>
          <span className={styles.card_body_textarea_length_base}>
            {500 + " Byte"}
          </span>
        </div>
        <div className={styles.card_body_bottom_btns}>
          <Button onClick={submit} size="sm" disabled={loading}>
            {loading ? "등록중..." : "등록"}
          </Button>
          {updatePost.postData ? (
            <Button
              onClick={cancleModify}
              size="sm"
              className={styles.card_body_cancle_btn}
            >
              취소
            </Button>
          ) : null}
        </div>
      </Card.Body>
    </>
  );
}
