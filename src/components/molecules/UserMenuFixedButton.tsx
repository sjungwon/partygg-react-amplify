import gsap from "gsap";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import useScrollHeight from "../../hooks/useScrollHeight";
import useViewportSize from "../../hooks/useViewportSize";
import AddProfileModal from "./AddProfileModal";
import styles from "./scss/UserMenuFixedButton.module.scss";

interface PropsType {}

const UserMenuFixedButton: FC<PropsType> = () => {
  const [hide, setHide] = useState<boolean>(true);

  const showHandler = useCallback(() => {
    setHide((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setHide(true);
  }, []);

  const viewSize = useViewportSize();
  const scrollHeight = useScrollHeight();
  const containerRef = useRef<HTMLDivElement>(null);
  //button 보여주기 & 숨기기
  useEffect(() => {
    const viewportHeight = viewSize.y;
    if (scrollHeight > viewportHeight / 2 && containerRef.current) {
      gsap.to(containerRef.current, {
        display: "block",
        opacity: 1,
      });
    } else {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          display: "none",
          opacity: 0,
        });
      }
    }
  }, [viewSize, scrollHeight]);

  return (
    <div className={styles.container} ref={containerRef}>
      <UserMenuFixed hide={hide} closeMenu={closeMenu} />
      <button className={styles.menu_btn} onClick={showHandler}>
        <AiOutlinePlus />
      </button>
    </div>
  );
};

interface UserMenuFixedProps {
  hide: boolean;
  closeMenu: () => void;
}

const UserMenuFixed: FC<UserMenuFixedProps> = ({ hide, closeMenu }) => {
  const goBack = useCallback(() => {
    window.scrollTo(0, 0);
    closeMenu();
  }, [closeMenu]);

  const [mdShow, setMdShow] = useState<boolean>(false);
  const mdOpen = useCallback(() => {
    setMdShow(true);
  }, []);
  const mdClose = useCallback(() => {
    setMdShow(false);
    closeMenu();
  }, [closeMenu]);

  return (
    <div className={`${styles.menu} ${hide ? styles.menu_hide : ""}`}>
      <button onClick={mdOpen} className={styles.menu_item}>
        프로필 추가
      </button>
      <button onClick={goBack} className={styles.menu_item}>
        맨 위로
      </button>
      <AddProfileModal show={mdShow} close={mdClose} />
    </div>
  );
};

export default UserMenuFixedButton;
