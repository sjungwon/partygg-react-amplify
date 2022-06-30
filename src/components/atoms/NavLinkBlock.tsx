import { FC, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styles from "./scss/NavLinkBlock.module.scss";

interface PropsType {
  children: ReactNode;
  to: string;
}

const NavLinkBlock: FC<PropsType> = ({ children, to }) => {
  return (
    <NavLink to={to} className={styles.nav_link}>
      {children}
    </NavLink>
  );
};

export default NavLinkBlock;
