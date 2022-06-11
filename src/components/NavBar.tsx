import { useCallback, useContext, useRef, useState } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserDataContextProvider";
import styles from "./NavBar.module.scss";

export default function NavBar() {
  const { username, logout } = useContext(UserDataContext);
  const [selectedMenu, setSelectedMenu] = useState<string>("게임");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const clickToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const menuSelect = useCallback((eventKey: string | null) => {
    console.log(eventKey);
    if (eventKey) {
      setSelectedMenu(eventKey);
    }
  }, []);

  const searchSubmit = useCallback(() => {
    const searchParam = searchInputRef.current
      ? searchInputRef.current.value
      : "";
    if (!searchParam) {
      navigate("/");
      return;
    }
    const category = selectedMenu === "게임" ? "games" : "usernames";
    navigate(`/${category}/${searchParam}`);
  }, [navigate, selectedMenu]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_fixed}>
        <div className={styles.navbar_container}>
          <div onClick={goHome} className={styles.navbar_title}>
            <img src="/logo192.png" alt="logo" className={styles.navbar_logo} />
            <h1>PartyGG</h1>
          </div>
          <div className={styles.navbar_search}>
            <DropdownButton
              id="dropdown-search-menu"
              title={selectedMenu}
              size="sm"
              onSelect={menuSelect}
            >
              <Dropdown.Item eventKey="게임">게임</Dropdown.Item>
              <Dropdown.Item eventKey="이름">사용자 이름</Dropdown.Item>
            </DropdownButton>
            <input
              type="text"
              placeholder={selectedMenu}
              className={styles.navbar_search_input}
              ref={searchInputRef}
            />
            <Button
              size="sm"
              className={styles.navbar_search_btn}
              onClick={searchSubmit}
            >
              검색
            </Button>
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
