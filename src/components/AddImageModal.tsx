import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ImageSlide from "./ImageSlide";
import styles from "./AddImageModal.module.scss";
import { BsTrash } from "react-icons/bs";
import { AiOutlineFileAdd } from "react-icons/ai";
import { ImageKeys } from "../types/file.type";

interface PropsType {
  mdShow: boolean;
  closeMd: () => void;
  postImages: string[];
  setPostImage: (value: string[]) => void;
  setPostFiles: (value: File[]) => void;
  postImageKeys: ImageKeys[];
  setPostImageKeys: (value: ImageKeys[]) => void;
}

export default function AddPostImageModal({
  mdShow,
  closeMd,
  postImages,
  setPostImage,
  setPostFiles,
  postImageKeys,
  setPostImageKeys,
}: PropsType) {
  //이미지 상태 데이터
  const [images, setImages] = useState<string[]>([]);
  const [imageKeys, setImageKeys] = useState<ImageKeys[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  //모달이 열린 상태에서
  //이미지가 변하면 해당 이미지로 설정 -> postImages는 props로 들어오는거라
  //모달이 열린 상태에선 이미지가 변하지 않음 -> 모달 초기 설정
  useEffect(() => {
    if (mdShow) {
      setImages(postImages);
      setImageKeys(postImageKeys);
    }
  }, [mdShow, postImageKeys, postImages]);

  //이미지 인덱스 상태 데이터
  const [index, setIndex] = useState<number>(0);

  //파일 추가되면 크기 조절, state에 추가
  const AddImages = async (event: any) => {
    if (
      (event.target as HTMLInputElement).files &&
      (event.target as HTMLInputElement).files?.length
    ) {
      const files: FileList | null = (event.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        setFiles((prev) => [...prev, ...fileArray]);
        const fileURLs = fileArray.map((file) => URL.createObjectURL(file));
        setImages((prev) => [...prev, ...fileURLs]);
        setIndex(
          images.length + fileURLs.length > 1
            ? images.length + fileURLs.length - 1
            : 0
        );
      }
    }
  };

  //input file 태그
  const fileRef = useRef<HTMLInputElement>(null);

  //버튼 누르면 파일 input 태그 여는 함수
  const openFileInput = useCallback(() => {
    fileRef?.current?.click();
  }, [fileRef]);

  //현재 이미지 제거
  //경우의 수
  //이미 앞쪽 image가 있는 상태로 뒤에 file 추가
  //앞쪽 image 지움 -> file엔 영향 없어야함
  const removeImages = useCallback(
    (event: any): void => {
      console.log(index, imageKeys.length, files.length);
      if (index !== 0) {
        if (index < imageKeys.length) {
          setImageKeys((prevImageKeys: ImageKeys[]) =>
            prevImageKeys.filter((prevImage, i) => i !== index)
          );
        } else {
          const fileIndex = index - imageKeys.length;
          setFiles((prevFiles: File[]) =>
            prevFiles.filter((elem, i) => i !== fileIndex)
          );
        }
      } else {
        if (imageKeys.length) {
          setImageKeys((prevImageKeys: ImageKeys[]) =>
            prevImageKeys.filter((prevImage, i) => i !== index)
          );
        } else {
          setFiles((prevFiles: File[]) =>
            prevFiles.filter((elem, i) => i !== index)
          );
        }
      }
      setImages((prevImages: string[]) =>
        prevImages.filter((elem, i) => i !== index)
      );
      setIndex((index) => {
        if (index > 0) {
          return index - 1;
        } else {
          return index;
        }
      });
    },
    [files.length, imageKeys.length, index]
  );

  //상위 컴포넌트의 상태로 이미지 전달, 모달 닫음
  const submitImage = () => {
    setPostImage(images);
    setPostFiles(files);
    setPostImageKeys(imageKeys);
    closeMd();
  };

  return (
    <Modal show={mdShow} onHide={closeMd} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className={styles.modal_title}>사진 추가</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="file"
          accept="image/jpg image/png image/jpeg"
          onInput={AddImages}
          multiple
          className={styles.modal_body_file}
          ref={fileRef}
        />
        <div className={styles.modal_body_btns}>
          <div>
            <button
              onClick={openFileInput}
              className={styles.modal_body_btn}
              name="add-image"
            >
              <AiOutlineFileAdd />
            </button>
          </div>
          <div>
            <button
              onClick={removeImages}
              className={styles.modal_body_btn}
              name="remove-image"
            >
              <BsTrash />
            </button>
          </div>
        </div>
        <ImageSlide
          images={images}
          index={index}
          setIndex={setIndex}
          type="modal"
        />
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={submitImage}>추가</Button>
      </Modal.Footer>
    </Modal>
  );
}
