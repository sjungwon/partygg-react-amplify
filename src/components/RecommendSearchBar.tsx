import { useCallback, useContext, useState } from "react";
import { GameDataContext } from "../context/GameDataContextProvider";
import { getRegExp } from "korean-regexp";
import styles from "./RecommendSearchBar.module.scss";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { GameType } from "../types/game.type";
import TextValidServices from "../services/TextValidServices";

export default function GameSearchRecommend() {
  const { games } = useContext(GameDataContext);

  const [text, setText] = useState<string>("");

  const [selectedMenu, setSelectedMenu] = useState<string>("게임");
  const menuSelect = useCallback((eventKey: string | null) => {
    console.log(eventKey);
    if (eventKey) {
      setSelectedMenu(eventKey);
      setText("");
    }
  }, []);

  const [prevent, setPrevent] = useState<boolean>(false);
  const onChangeHandler = useCallback(
    (event: any) => {
      if (prevent) {
        setPrevent(false);
        return;
      }
      const inputEl: HTMLInputElement = event.target;
      setText(inputEl.value);
      if (inputEl.value) {
        const textReg = getRegExp(inputEl.value);
        const find = games.filter(
          (game) => textReg && game.name.search(textReg) !== -1
        );
        setFindedGames(find);
      } else {
        setFindedGames([]);
      }
    },
    [games, prevent]
  );

  const navigate = useNavigate();
  const searchSubmit = useCallback(
    (optionalParam?: string) => {
      return () => {
        const searchParam = optionalParam ? optionalParam : text;
        if (!searchParam) {
          return;
        }
        if (TextValidServices.isIncludePathSpecial(searchParam)) {
          window.alert(
            `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
          );
          return;
        }
        const category = selectedMenu === "게임" ? "games" : "usernames";
        navigate(`/posts/${category}/${searchParam}`);
        setFindedGames([]);
      };
    },
    [navigate, selectedMenu, text]
  );

  const [findedGames, setFindedGames] = useState<GameType[]>([]);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [index, setIndex] = useState<number>(-1);
  const keyDownEventHandler = useCallback(
    (event: any) => {
      console.log(isComposing);
      if (isComposing) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const newIndex = (index + 1) % findedGames.length;
        setIndex(newIndex);
        setText(findedGames[newIndex].name);
        setPrevent(true);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const newIndex = (index - 1 + findedGames.length) % findedGames.length;
        setIndex(newIndex);
        setText(findedGames[newIndex].name);
        setPrevent(true);
        return;
      }
      if (event.key === "Enter") {
        console.log("enter");
        searchSubmit()();
      }
      setIndex(-1);
      setPrevent(false);
    },
    [findedGames, index, isComposing, searchSubmit]
  );

  const click_Finded = useCallback(
    (event: any) => {
      const target: HTMLDivElement = event.target;
      const text = target.textContent;
      console.log(target, text);
      if (text) {
        setText(text);
        setPrevent(true);
        searchSubmit(text)();
      }
    },
    [searchSubmit]
  );

  return (
    <div className={styles.container}>
      <DropdownButton
        id="dropdown-search-menu"
        title={selectedMenu}
        size="sm"
        onSelect={menuSelect}
        variant="secondary"
      >
        <Dropdown.Item eventKey="게임">게임</Dropdown.Item>
        <Dropdown.Item eventKey="이름">사용자 이름</Dropdown.Item>
      </DropdownButton>
      <div className={styles.input_container}>
        <input
          type="text"
          placeholder={selectedMenu}
          className={styles.search_input}
          onChange={onChangeHandler}
          value={text}
          onKeyDown={keyDownEventHandler}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
        <div
          className={`${styles.search_recommand_container} ${
            findedGames.length ? "" : styles.hide
          }`}
        >
          {selectedMenu === "게임"
            ? findedGames.map((game, i) => {
                if (i === index) {
                  return (
                    <div
                      className={styles.finded_game_border}
                      onClick={click_Finded}
                      key={game.name}
                    >
                      {game.name}
                    </div>
                  );
                }
                return (
                  <div onClick={click_Finded} key={game.name}>
                    {game.name}
                  </div>
                );
              })
            : null}
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        className={styles.navbar_search_btn}
        onClick={searchSubmit()}
      >
        검색
      </Button>
    </div>
  );
}
