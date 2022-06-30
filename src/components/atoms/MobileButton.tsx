import { FC, MouseEventHandler } from "react";
import { ChildProps } from "../../types/props.type";
import styles from "./scss/MobileButton.module.scss";

interface PropsType extends ChildProps {
  onClick: MouseEventHandler;
  className?: string;
}

const MobileButton: FC<PropsType> = ({ children, onClick, className }) => {
  return (
    <button
      className={`${styles.btn} ${className ? className : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default MobileButton;
