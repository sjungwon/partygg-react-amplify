import { Dropdown, DropdownButton } from "react-bootstrap";
import { GameType } from "../../types/game.type";
import styles from "./scss/Selector.module.scss";

interface PropsType {
  games: GameType[];
  onSelect: (eventKey: string | null) => void;
  size: "sm" | "lg";
}

export default function GameSelector({ games, onSelect, size }: PropsType) {
  return (
    <DropdownButton
      id="dropdown-gameList"
      title="게임"
      onSelect={onSelect}
      size={size}
      disabled={!games.length}
    >
      {games.map((game, index) => {
        return (
          <Dropdown.Item
            key={game.name}
            eventKey={index}
            className={styles.item}
          >
            {game.name}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}
