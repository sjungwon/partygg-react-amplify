import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCategoryBar from "../components/GameCategoryBar";
import NavBar from "../components/NavBar";
import PostList from "../components/posts/PostList";
import UserInfoBar from "../components/UserInfoBar";
import { UserDataContext } from "../context/UserDataContextProvider";
import useCategory from "../hooks/useCategory";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const { category, searchParam }: { category: string; searchParam: string } =
    useCategory();
  console.log("home", category, searchParam);

  const { setFilteredProfileHandler, setFilteredProfileHandlerByProfile } =
    useContext(UserDataContext);

  const [showCategory, setShowCategory] = useState<boolean>(false);
  const showCategoryHandler = useCallback(() => {
    setShowCategory((prev) => !prev);
  }, []);

  const navigate = useNavigate();
  useEffect(() => {
    if (category && !searchParam) {
      window.alert("잘못된 링크로 접속하셨습니다.");
      navigate(-1);
    } else if (category === "games" && searchParam) {
      setFilteredProfileHandler(decodeURI(searchParam));
      setShowCategory(false);
    } else if (category === "profiles" && searchParam) {
      setFilteredProfileHandlerByProfile(searchParam);
    } else {
      setFilteredProfileHandler("");
      setShowCategory(false);
    }
  }, [
    category,
    navigate,
    searchParam,
    setFilteredProfileHandler,
    setFilteredProfileHandlerByProfile,
  ]);

  return (
    <div className={styles.container}>
      <NavBar showCategoryHandler={showCategoryHandler} />
      <div className={styles.content_container}>
        <GameCategoryBar show={showCategory} />
        <PostList
          key={`${category}/${searchParam}`}
          category={category}
          searchParam={searchParam}
        />
        <UserInfoBar />
      </div>
    </div>
  );
}
