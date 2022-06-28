import { FC, useCallback, useContext, useRef, useState } from "react";
import { GameDataContext } from "../../context/GameDataContextProvider";
import GameServices from "../../services/GameServices";
import TextValidServices from "../../services/TextValidServices";
import DefaultButton from "../atoms/DefaultButton";
import DefaultTextInput from "../atoms/DefaultTextInput";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/AddGames.module.scss";

interface PropsType {
  display?: "flex" | "block";
}

const AddGames: FC<PropsType> = ({ display = "block" }) => {
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

    if (TextValidServices.isIncludePathSpecial(gameText)) {
      window.alert(
        `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
      );
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

  return (
    <div
      className={`${styles.container} ${
        display === "flex" ? styles["container_flex"] : ""
      }`}
    >
      {display === "flex" ? (
        <label className={styles.text_label}>게임 추가 : </label>
      ) : null}
      <DefaultTextInput
        ref={gameInputRef}
        placeholder="게임 이름"
        className={`${styles.input} ${
          display === "flex" ? styles["input_flex"] : ""
        }`}
      />
      <DefaultButton
        size="sm"
        onClick={gameSubmit}
        disabled={loading}
        className={`${styles.btn} ${
          display === "flex" ? styles["btn_margin"] : ""
        }`}
        color={display === "flex" ? "blue" : "default"}
      >
        <LoadingBlock loading={loading}>추가</LoadingBlock>
      </DefaultButton>
    </div>
  );
};

export default AddGames;
