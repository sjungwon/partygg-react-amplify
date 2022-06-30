import { FC, ReactNode } from "react";
import styles from "./scss/CommentCard.module.scss";

interface ChildProps {
  children: ReactNode;
  borderBottom?: boolean;
}

const CommentCard: FC<ChildProps> = ({ children, borderBottom }) => {
  return (
    <div className={`${styles.card} ${borderBottom ? styles.card_border : ""}`}>
      {children}
    </div>
  );
};

const Header: FC<ChildProps> = ({ children }) => {
  return <div className={styles.header}>{children}</div>;
};

const Body: FC<ChildProps> = ({ children }) => {
  return <div className={styles.body}>{children}</div>;
};

const Buttons: FC<ChildProps> = ({ children }) => {
  return <div className={styles.buttons}>{children}</div>;
};

export default Object.assign(CommentCard, {
  Header,
  Body,
  Buttons,
});
