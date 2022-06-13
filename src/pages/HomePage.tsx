import { useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameCategoryBar from "../components/GameCategoryBar";
import NavBar from "../components/NavBar";
import PostList from "../components/posts/PostList";
import UserInfoBar from "../components/UserInfoBar";
import GameDataContextProvider from "../context/GameDataContextProvider";
import { UserDataContext } from "../context/UserDataContextProvider";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const location = useLocation();
  const { category, searchParam }: { category: string; searchParam: string } =
    useMemo(() => {
      const pathArr = location.pathname.split("/");
      return {
        category: pathArr[1],
        searchParam: pathArr.length > 2 ? pathArr[2] : "",
      };
    }, [location.pathname]);

  const { setFilteredProfileHandler } = useContext(UserDataContext);

  const navigate = useNavigate();
  useEffect(() => {
    if (category && !searchParam) {
      window.alert("잘못된 링크로 접속하셨습니다.");
      navigate(-1);
    } else if (category && searchParam) {
      setFilteredProfileHandler(decodeURI(searchParam));
    } else {
      setFilteredProfileHandler("");
    }
  }, [category, navigate, searchParam, setFilteredProfileHandler]);

  return (
    <GameDataContextProvider>
      <div>
        <NavBar />
        <div className={styles.content_container}>
          <GameCategoryBar />
          <PostList
            key={`${category}/${searchParam}`}
            category={category}
            searchParam={searchParam}
          />
          <UserInfoBar />
        </div>
      </div>
    </GameDataContextProvider>
  );
}
