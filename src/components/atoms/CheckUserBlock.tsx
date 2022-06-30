import { FC, useContext } from "react";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { ChildProps } from "../../types/props.type";

interface PropsType extends ChildProps {
  resourceUsername: string;
}

const CheckUserBlock: FC<PropsType> = ({ children, resourceUsername }) => {
  const { username } = useContext(UserDataContext);

  if (username !== resourceUsername) {
    return null;
  }

  return <>{children}</>;
};

export default CheckUserBlock;
