import { Carousel } from "react-bootstrap";
import styles from "./ImageSlide.module.scss";
import { useCallback, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import FileServices from "../services/FileServices";
import { ImageKeys } from "../types/file.type";
import axios from "axios";

interface PropsType {
  images: string[];
  index?: number;
  setIndex?: (index: number) => void;
  type?: string;
}

export default function ImageSlide({
  images,
  index,
  setIndex,
  type,
}: PropsType) {
  //슬라이드에서 현재 이미지 index 설정
  const handleSelect = useCallback(
    (selectedIndex: number) => {
      if (setIndex) {
        setIndex(selectedIndex);
      }
    },
    [setIndex]
  );

  //index가 변했을 때 = 이미지가 제거되거나 추가될 때
  //index 오류 방지를 위해 0으로 설정
  useEffect(() => {
    if (index && index < 1 && setIndex) {
      setIndex(0);
    }
  }, [setIndex, images, index]);

  const loadError = useCallback(async (event: any) => {
    const imageEl = event.target;
    const origSrc: string = imageEl.src;

    //key로 받아온 이미지가 아니면
    if (!origSrc.includes("fullsize") && !origSrc.includes("resized")) {
      imageEl.src = "";
      return;
    }

    //fullsize도 실패한 경우 -> 이미지 깨짐처리
    if (origSrc.includes("fullsize/")) {
      imageEl.src = "";
      return;
    }

    //key 다시 받아서 시도
    const resizedKeySplit = origSrc.split("/");
    const username = decodeURIComponent(resizedKeySplit[5]);
    const imageName = decodeURIComponent(resizedKeySplit[6].split("?")[0]);
    const key: ImageKeys = {
      resizedKey: `resized/${username}/${imageName}`,
      fullsizeKey: `fullsize/${username}/${imageName}`,
    };
    const resizedImageURL = await FileServices.getImage(key, "resized");
    if (resizedImageURL) {
      try {
        await axios.get(resizedImageURL);
        //성공시
        imageEl.src = resizedImageURL;
        return;
      } catch {
        //key 다시 받아도 실패한 경우
        const fullsizeImageURL = await FileServices.getImage(key, "fullsize");
        if (fullsizeImageURL) {
          imageEl.src = fullsizeImageURL;
        } else {
          imageEl.src = "";
        }
      }
    }

    //key 다시 받아도 실패한 경우
    const fullsizeImageURL = await FileServices.getImage(key, "fullsize");
    if (fullsizeImageURL) {
      imageEl.src = fullsizeImageURL;
    } else {
      imageEl.src = "";
    }
  }, []);

  return (
    <>
      <Carousel
        interval={null}
        variant="dark"
        className={type === "modal" ? styles.modal_slide : styles.slide}
        activeIndex={index}
        onSelect={handleSelect}
        controls={images.length > 1}
      >
        {images?.map((img: string, i: number) => {
          return (
            <Carousel.Item key={`${img.slice(0, 10)}${i}`}>
              {type === "modal" ? (
                <img
                  className={
                    type === "modal"
                      ? styles.modal_slide_item
                      : styles.slide_item
                  }
                  src={img}
                  alt="inputImg"
                  onError={loadError}
                />
              ) : (
                <LazyLoadImage
                  className={styles.slide_item}
                  src={img}
                  onError={loadError}
                />
              )}
              {/* <img
                className={
                  type === "modal" ? styles.modal_slide_item : styles.slide_item
                }
                src={img}
                alt="inputImg"
              /> */}
            </Carousel.Item>
          );
        })}
      </Carousel>
    </>
  );
}
