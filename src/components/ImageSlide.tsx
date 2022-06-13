import { Carousel } from "react-bootstrap";
import styles from "./ImageSlide.module.scss";
import { useCallback, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import useImgLoadError from "../hooks/useImgLoadError";

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

  //s3에 추가되기 전 이미지를 불러오기 오류나면 깨짐 처리
  //s3 이미지면 lazy loading으로 url에 담긴 유저 권한이 유효기간을 넘겼을 수 있음
  //다시 resized 이미지 url 받아와서 axios로 이미지 받을 수 있는지 확인
  //실패하면 fullsize 이미지로 설정
  //fullsize 이미지도 실패하면 깨짐 처리
  const loadError = useImgLoadError();

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
            </Carousel.Item>
          );
        })}
      </Carousel>
    </>
  );
}
