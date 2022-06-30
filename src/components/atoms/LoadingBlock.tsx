import { FC, ReactNode } from "react";
import styles from "./scss/LoadingBlock.module.scss";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface PropsType {
  children: ReactNode;
  loading: boolean;
  size?: "md";
}

const LoadingBlock: FC<PropsType> = ({ loading, children, size }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <>
      <AiOutlineLoading3Quarters
        className={`${styles.loading_icon} ${
          size ? styles[`size_${size}`] : ""
        }`}
      />
      {children}
    </>
  );
};

export default LoadingBlock;
