import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserDataContextProvider";
import GameSearchRecommend from "./RecommendSearchBar";
import styles from "./NavBar.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  AiOutlineLogout,
  AiOutlineLogin,
  AiOutlineSearch,
} from "react-icons/ai";
import gsap from "gsap";

interface PropsType {
  showCategoryHandler: () => void;
}

export default function NavBar({ showCategoryHandler }: PropsType) {
  const { username, logout } = useContext(UserDataContext);
  const navigate = useNavigate();
  const clickToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const showSearchBarHandler = useCallback(() => {
    setShowSearchBar((prev) => !prev);
  }, []);

  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth > 829) {
      console.log("desktop");
      return;
    }
    if (searchBarRef.current && showSearchBar) {
      gsap.to(searchBarRef.current, 0.2, {
        display: "flex",
        opacity: 1,
      });
    }
    if (searchBarRef.current && !showSearchBar) {
      gsap.to(searchBarRef.current, 0.2, {
        display: "none",
        opacity: 0,
      });
    }
  }, [showSearchBar]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_fixed}>
        <div className={styles.navbar_container}>
          <button className={styles.navbar_menu} onClick={showCategoryHandler}>
            <GiHamburgerMenu />
          </button>
          <button
            className={styles.navbar_search_btn}
            onClick={showSearchBarHandler}
          >
            <AiOutlineSearch />
          </button>
          <a href="/" className={styles.navbar_title}>
            <img src="/logo192.png" alt="logo" className={styles.navbar_logo} />
            <h1>PartyGG</h1>
          </a>
          <div className={styles.navbar_search} ref={searchBarRef}>
            <GameSearchRecommend
              showInputHandlerForMobile={showSearchBarHandler}
            />
          </div>
          <div className={styles.navbar_btns}>
            {username ? <div>{username}</div> : null}
            {username ? (
              <Button
                size="sm"
                onClick={logout}
                variant="secondary"
                className={styles.navbar_btn_login}
              >
                <AiOutlineLogout />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={clickToLogin}
                variant="secondary"
                className={styles.navbar_btn_login}
              >
                <AiOutlineLogin />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
