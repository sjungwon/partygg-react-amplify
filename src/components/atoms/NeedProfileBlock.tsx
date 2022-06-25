import { FC, ReactNode } from "react";
import { Profile } from "../../types/profile.type";
import styles from "./scss/NeedProfileBlock.module.scss";

interface PropsType {
  children: ReactNode;
  profiles: Profile[];
  requiredMessage?: string;
}

const NeedProfileBlock: FC<PropsType> = ({
  children,
  profiles,
  requiredMessage,
}) => {
  if (profiles.length) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      {requiredMessage ? requiredMessage : ""} 프로필을 추가해주세요.
    </div>
  );
};

export default NeedProfileBlock;
