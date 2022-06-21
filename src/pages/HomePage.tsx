import { useCallback, useContext, useEffect, useState } from "react";
import GameCategoryBar from "../components/GameCategoryBar";
import NavBar from "../components/NavBar";
import PostList from "../components/posts/PostList";
import UserInfoBar from "../components/UserInfoBar";
import { UserDataContext } from "../context/UserDataContextProvider";
import useCategory from "../hooks/useCategory";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const { category, searchParam } = useCategory();

  const { setFilteredProfileHandler, setFilteredProfileHandlerByProfile } =
    useContext(UserDataContext);

  const [showCategory, setShowCategory] = useState<boolean>(false);
  const showCategoryHandler = useCallback(() => {
    setShowCategory((prev) => !prev);
  }, []);

  useEffect(() => {
    if (category === "games" && searchParam) {
      setFilteredProfileHandler(decodeURI(searchParam));
      setShowCategory(false);
    } else if (category === "profiles" && searchParam) {
      setFilteredProfileHandlerByProfile(searchParam);
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
        <PostList category={category} searchParam={searchParam} />
        <UserInfoBar />
      </div>
    </div>
  );
}
