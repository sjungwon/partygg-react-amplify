import { FC, ReactNode, useContext } from "react";
import { UserDataContext } from "../../context/UserDataContextProvider";
import styles from "./scss/NeedLoginBlock.module.scss";

interface PropsType {
  children: ReactNode;
  requiredMessage?: string;
}

const NeedLoginBlock: FC<PropsType> = ({ children, requiredMessage }) => {
  const { username } = useContext(UserDataContext);

  if (username) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      {requiredMessage ? requiredMessage : ""} 로그인이 필요합니다.
    </div>
  );
};

export default NeedLoginBlock;
