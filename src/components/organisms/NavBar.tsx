import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../../context/UserDataContextProvider";
import GameSearchRecommend from "../molecules/RecommendSearchBar";
import styles from "./scss/NavBar.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import gsap from "gsap";
import _ from "lodash";
import MobileButton from "../atoms/MobileButton";
import DefaultButton from "../atoms/DefaultButton";

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

  //모바일에서 search 버튼 클릭 시 searchBar 애니메이션 처리
  useEffect(() => {
    if (window.innerWidth > 829) {
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

  //데스크탑인 경우 화면 크기 변경으로 searchBar가 안나올 수 있는거 방지
  const [viewWidth, setViewWidth] = useState<number>(0);
  const widthChangeHandler = useMemo(
    () =>
      _.debounce(function (this: Window, event: UIEvent) {
        setViewWidth(this.innerWidth);
      }, 300),
    []
  );

  useEffect(() => {
    window.addEventListener("resize", widthChangeHandler);
    return () => {
      window.removeEventListener("resize", widthChangeHandler);
    };
  }, [widthChangeHandler]);

  useEffect(() => {
    if (viewWidth > 829 && searchBarRef.current) {
      searchBarRef.current.style.display = "flex";
      searchBarRef.current.style.opacity = "1";
    } else {
      if (viewWidth > 0 && searchBarRef.current) {
        searchBarRef.current.style.display = "none";
        searchBarRef.current.style.opacity = "0";
      }
    }
  }, [viewWidth]);

  const goHome = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    navigate(`/usernames/${username}`);
  }, [navigate, username]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbar_fixed}>
        <div className={styles.navbar_container}>
          <div className={styles.navbar_btns}>
            <MobileButton
              onClick={showCategoryHandler}
              className={styles.btn_margin}
            >
              <GiHamburgerMenu />
            </MobileButton>
            <MobileButton onClick={showSearchBarHandler}>
              <AiOutlineSearch />
            </MobileButton>
          </div>
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
            <DefaultButton
              size="sq_md"
              onClick={goHome}
              className={styles.btn_home}
            >
              <CgProfile />
            </DefaultButton>
            {username ? (
              <DefaultButton
                size="sm"
                onClick={logout}
                className={styles.btn_login}
              >
                로그아웃
              </DefaultButton>
            ) : (
              <DefaultButton
                size="sm"
                onClick={clickToLogin}
                className={styles.btn_login}
              >
                로그인
              </DefaultButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}