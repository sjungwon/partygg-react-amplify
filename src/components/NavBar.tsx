import { useCallback, useContext, useRef, useState } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserDataContextProvider";
import GameSearchRecommend from "./RecommendSearchBar";
import styles from "./NavBar.module.scss";

export default function NavBar() {
  const { username, logout } = useContext(UserDataContext);
  const navigate = useNavigate();
  const clickToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_fixed}>
        <div className={styles.navbar_container}>
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
                className={styles.navbar_btn_login}
              >
                로그아웃
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={clickToLogin}
                className={styles.navbar_btn_login}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
