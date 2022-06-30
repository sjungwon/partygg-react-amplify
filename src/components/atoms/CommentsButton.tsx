import { FC, MouseEventHandler } from "react";
import DefaultButton from "./DefaultButton";
import { FaComment, FaRegComment } from "react-icons/fa";
import styles from "./scss/CommentsButton.module.scss";

interface PropsType {
  size: "lg" | "sm";
  active: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const CommentsButton: FC<PropsType> = ({ size, active, onClick }) => {
  return (
    <DefaultButton size={size} onClick={onClick}>
      {active ? <FaComment className={styles.btn_icon} /> : <FaRegComment />}{" "}
      <p
        className={`${styles.btn_text} ${
          size === "sm" ? styles.btn_text_sm : ""
        }`}
      >
        댓글
      </p>
    </DefaultButton>
  );
};

export default CommentsButton;
