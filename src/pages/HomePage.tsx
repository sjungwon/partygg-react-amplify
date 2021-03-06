import { useCallback, useContext, useEffect, useState } from "react";
import GameCategoryBar from "../components/organisms/GameCategoryBar";
import NavBar from "../components/organisms/NavBar";
import PostList from "../components/organisms/PostList";
import UserInfoBar from "../components/organisms/UserInfoBar";
import PostListContextProvider from "../context/PostListContextProvider";
import { UserDataContext } from "../context/UserDataContextProvider";
import useCategory from "../hooks/useCategory";
import { useIsMobile } from "../hooks/useIsMobile";
import useScrollLock from "../hooks/useScrollLock";
import styles from "./scss/HomePage.module.scss";

export default function HomePage() {
  const { category, searchParam } = useCategory();

  const { setFilteredProfileHandler, setFilteredProfileHandlerByProfile } =
    useContext(UserDataContext);

  const { scrollLock, scrollRelease } = useScrollLock();
  const [showCategory, setShowCategory] = useState<boolean>(false);
  const showCategoryHandler = useCallback(() => {
    setShowCategory((prev) => {
      if (prev) {
        scrollRelease();
      } else {
        scrollLock();
      }
      return !prev;
    });
  }, [scrollLock, scrollRelease]);

  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = "auto";
    }
  }, [isMobile]);

  useEffect(() => {
    if (category === "games" && searchParam) {
      setFilteredProfileHandler(decodeURI(searchParam));
      setShowCategory(false);
      return;
    } else if (category === "profiles" && searchParam) {
      setFilteredProfileHandlerByProfile(searchParam);
      return;
    }
    setFilteredProfileHandler("");
    setShowCategory(false);
  }, [
    category,
    searchParam,
    setFilteredProfileHandler,
    setFilteredProfileHandlerByProfile,
  ]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    });
  }, [category, searchParam]);

  return (
    <div className={styles.container}>
      <NavBar showCategoryHandler={showCategoryHandler} />
      <div className={styles.content_container}>
        <GameCategoryBar show={showCategory} />
        <PostListContextProvider category={category} searchParam={searchParam}>
          <PostList />
        </PostListContextProvider>
        <UserInfoBar />
      </div>
    </div>
  );
}
