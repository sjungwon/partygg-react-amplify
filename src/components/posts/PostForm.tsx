import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button, Card, CloseButton } from "react-bootstrap";
import styles from "./PostForm.module.scss";
import ImageSlide from "../ImageSlide";
import AddImageModal from "../AddImageModal";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { Post } from "../../types/post.type";

interface PropsType {
  close: () => void;
  prevData?: Post;
}

export default function AddPostForm({ close, prevData }: PropsType) {
  //기본 form 데이터 -> 이미지, 텍스트, 프로필
  const { currentProfile } = useContext(UserDataContext);
  const [images, setImages] = useState<string[] | null>(null);
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
  //제출 버튼 눌렀을 때 사용할 함수
  const submit = useCallback(() => {
    const text = textRef?.current?.value;
    if (text || images) {
      const data = {
        text: text ? text : "",
        images: images ? images : null,
        ...currentProfile,
      };
      if (prevData) {
        // dispatch(
        //   modifyPostThunk({
        //     ...prevData,
        //     ...data,
        //   })
        // );
      } else {
        // dispatch(addPostThunk(data));
      }
      // dispatch(setModifyPostId(null));
    }
  }, [currentProfile, images, prevData]);

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

      console.log(value);
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

  //post를 수정하는 경우에도 사용 -> 이전 데이터가 있으면
  //즉 수정하는 경우면 이전 데이터를 렌더에 설정
  useEffect(() => {
    if (prevData) {
      setImages(prevData.images);
      setCurrentTextByte(calcByte(prevData.text));
    }
  }, [calcByte, prevData]);

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
          />
          <CloseButton onClick={close} />
        </div>
        {images ? <ImageSlide images={images} /> : null}
        <textarea
          className={styles.card_body_textarea}
          ref={textRef}
          autoFocus
          onChange={calcCurrentByte}
          placeholder="500Byte 이하로 작성 가능합니다."
          defaultValue={prevData ? prevData.text : ""}
        />
        <div className={styles.card_body_textarea_length}>
          <span className={styles.card_body_textarea_cur}>
            {currentTextByte + " Byte / "}
          </span>
          <span className={styles.card_body_textarea_length_base}>
            {500 + " Byte"}
          </span>
        </div>
        <Button onClick={submit}>등록</Button>
      </Card.Body>
    </>
  );
}
