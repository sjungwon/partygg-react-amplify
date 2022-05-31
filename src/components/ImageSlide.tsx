import { Carousel } from "react-bootstrap";
import styles from "./ImageSlide.module.scss";
import { useCallback, useEffect } from "react";

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

  return (
    <>
      <Carousel
        interval={null}
        variant="dark"
        className={type === "modal" ? styles.modal_slide : styles.slide}
        activeIndex={index}
        onSelect={handleSelect}
      >
        {images?.map((img: string, i: number) => {
          return (
            <Carousel.Item key={`${img.slice(0, 10)}${i}`}>
              <img
                className={
                  type === "modal" ? styles.modal_slide_item : styles.slide_item
                }
                src={img}
                alt="inputImg"
              />
            </Carousel.Item>
          );
        })}
      </Carousel>
    </>
  );
}
