import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameServices from "../services/GameServices";
import { AiOutlineUnorderedList, AiOutlineClose } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import styles from "./GameCategoryBar.module.scss";
import { GameDataContext } from "../context/GameDataContextProvider";
import TextValidServices from "../services/TextValidServices";

export default function GameCategoryBar() {
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

  const navigate = useNavigate();
  const location = useLocation();
  const {
    path,
    category,
    searchParam,
  }: { path: string; category: string; searchParam: string } = useMemo(() => {
    const path = location.pathname;
    const splitPath = path.split("/");
    const category = splitPath[1];
    const searchParam = splitPath.length > 2 ? splitPath[2] : "";
    return {
      path,
      category,
      searchParam,
    };
  }, [location]);

  const categoryChange = useCallback(
    (event: any) => {
      const El = event.target as HTMLDivElement;
      const queryParam = El.textContent;
      console.log(queryParam);
      const newPath = `/games/${queryParam}`;
      const encodeNewPath = encodeURI(newPath);
      console.log(path, newPath, encodeNewPath);
      if (path !== encodeNewPath) {
        navigate(`/games/${queryParam}`);
      }
    },
    [navigate, path]
  );

  const categoryAll = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const setShowAddHandler = useCallback(() => {
    setShowAdd((prev) => !prev);
    const gameText = gameInputRef.current;
    if (gameText) {
      gameText.value = "";
    }
  }, []);

  console.log(searchParam, games);
  return (
    <div className={styles.container}>
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
      <ul className={styles.category_list}>
        <li
          onClick={categoryAll}
          className={`${styles.category_item} ${category ? "" : styles.active}`}
        >
          <p className={styles.item_text}>전체 보기</p>
        </li>
        {games.map((game) => (
          <li
            key={game.name}
            onClick={categoryChange}
            className={`${styles.category_item} ${
              searchParam === encodeURI(game.name) ? styles.active : ""
            }`}
          >
            <p className={styles.item_text}>{game.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
