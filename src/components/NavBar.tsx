import { useCallback, useContext } from "react";
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

interface PropsType {
  showCategoryHandler: () => void;
}

export default function NavBar({ showCategoryHandler }: PropsType) {
  const { username, logout } = useContext(UserDataContext);
  const navigate = useNavigate();
  const clickToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_fixed}>
        <div className={styles.navbar_container}>
          <button className={styles.navbar_menu} onClick={showCategoryHandler}>
            <GiHamburgerMenu />
          </button>
          <button className={styles.navbar_search_btn}>
            <AiOutlineSearch />
          </button>
          <a href="/" className={styles.navbar_title}>
            <img src="/logo192.png" alt="logo" className={styles.navbar_logo} />
            <h1>PartyGG</h1>
          </a>
          <div className={styles.navbar_search}>
            <GameSearchRecommend />
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
