import { useCallback, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineUnorderedList } from "react-icons/ai";
import styles from "./scss/GameCategoryBar.module.scss";
import { GameDataContext } from "../../context/GameDataContextProvider";
import { UserDataContext } from "../../context/UserDataContextProvider";
import AddGames from "../molecules/AddGames";
import DefaultButton from "../atoms/DefaultButton";

interface PropsType {
  show: boolean;
}

export default function GameCategoryBar({ show }: PropsType) {
  const { games } = useContext(GameDataContext);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const { username } = useContext(UserDataContext);
  const setShowAddHandler = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd((prev) => !prev);
  }, [username]);

  return (
    <div className={`${styles.container} ${show ? styles.container_show : ""}`}>
      <div className={styles.container_padding}>
        <div className={styles.category_list_title_container}>
          <div className={styles.category_list_title}>
            <div className={styles.list_title}>
              <AiOutlineUnorderedList />
              <h3 className={styles.category_title}>게임 리스트</h3>
            </div>
            <DefaultButton
              size="sm"
              onClick={setShowAddHandler}
              disabled={!username}
            >
              게임 추가
            </DefaultButton>
          </div>
          {showAdd ? <AddGames /> : null}
        </div>
        <nav
          className={`${styles.category_list} ${
            showAdd ? styles.list_short : ""
          }`}
        >
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `${styles.category_item} ${isActive ? styles.active : ""}`
            }
          >
            전체 보기
          </NavLink>

          {games.map((game) => (
            <NavLink
              to={`/games/${encodeURI(game.name)}`}
              key={game.name}
              className={({ isActive }) =>
                `${styles.category_item} ${isActive ? styles.active : ""}`
              }
            >
              {game.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
