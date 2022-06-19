import { useCallback, useContext, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import GameServices from "../services/GameServices";
import { AiOutlineUnorderedList, AiOutlineClose } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import styles from "./GameCategoryBar.module.scss";
import { GameDataContext } from "../context/GameDataContextProvider";
import TextValidServices from "../services/TextValidServices";
import { UserDataContext } from "../context/UserDataContextProvider";

interface PropsType {
  show: boolean;
}

export default function GameCategoryBar({ show }: PropsType) {
  const { games, setGamesHandler } = useContext(GameDataContext);

  const gameInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const gameSubmit = useCallback(async () => {
    const gameText = gameInputRef.current
      ? gameInputRef.current.value.trim()
      : "";
    if (!gameText) {
      return;
    }

    if (TextValidServices.isIncludeSpecial(gameText)) {
      window.alert("특수문자를 포함할 수 없습니다. 제거하고 시도해주세요.");
      return;
    }

    if (games.find((game) => game.name === gameText)) {
      window.alert("이미 존재하는 게임입니다.");
      return;
    }
    setLoading(true);
    const success = await GameServices.addGames(gameText);
    if (!success) {
      window.alert("게임 추가에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setLoading(false);
    setGamesHandler([...games, { name: gameText }]);
    if (gameInputRef.current) {
      gameInputRef.current.value = "";
    }
  }, [games, setGamesHandler]);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const { username } = useContext(UserDataContext);
  const setShowAddHandler = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd((prev) => !prev);
    const gameText = gameInputRef.current;
    if (gameText) {
      gameText.value = "";
    }
  }, [username]);

  return (
    <div className={`${styles.container} ${show ? "" : styles.container_hide}`}>
      <div className={styles.container_padding}>
        <div className={styles.category_list_title}>
          <AiOutlineUnorderedList />
          <h3 className={styles.category_title}>게임 리스트</h3>
          <button
            className={styles.category_title_button}
            onClick={setShowAddHandler}
          >
            {showAdd ? <AiOutlineClose /> : <BsPlusLg />}
          </button>
        </div>
        <div className={showAdd ? styles.category_add : styles.hide}>
          <input
            type="text"
            ref={gameInputRef}
            placeholder="게임 이름"
            className={styles.category_add_input}
          />
          <button
            onClick={gameSubmit}
            disabled={loading}
            className={styles.category_add_button}
          >
            {<BsPlusLg />}
          </button>
        </div>
        <nav className={styles.category_list}>
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
              to={`/posts/games/${encodeURI(game.name)}`}
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
