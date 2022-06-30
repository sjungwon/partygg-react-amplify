import { Dropdown } from "react-bootstrap";
import { Profile } from "../../types/profile.type";
import styles from "./scss/Selector.module.scss";

interface PropsType {
  size?: "sm" | "lg";
  onSelect: (eventKey: string | null) => void;
  profileArr: Profile[];
}

export default function ProfileSelector({
  size,
  onSelect,
  profileArr,
}: PropsType) {
  return (
    <Dropdown onSelect={onSelect}>
      <Dropdown.Toggle
        size={size}
        id="dropdown-profile"
        title="프로필"
        disabled={!profileArr.length}
      >
        프로필 선택
        <Dropdown.Menu>
          {profileArr.map((profile, index) => {
            return (
              <Dropdown.Item
                key={profile.game + profile.nickname}
                eventKey={index}
                className={styles.item}
              >
                {profile.game} - {profile.nickname}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Toggle>
    </Dropdown>
  );
}
