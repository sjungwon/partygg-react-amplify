import {
  ButtonHTMLAttributes,
  forwardRef,
  MouseEventHandler,
  ReactNode,
} from "react";
import styles from "./scss/DefaultButton.module.scss";

interface CustomAttributes {
  "data-index": string;
  "data-type": string;
}

interface PropsType {
  children: ReactNode;
  size: "sm" | "md" | "lg" | "sq_md" | "xs" | "xl";
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  color?: "blue" | "default";
  attributes?: CustomAttributes &
    React.DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >;
}

const DefaultButton = forwardRef<HTMLButtonElement, PropsType>(
  (
    {
      children,
      size,
      onClick,
      className,
      disabled,
      color = "default",
      attributes,
    },
    buttonRef
  ) => {
    return (
      <button
        className={`${styles.btn} ${
          color !== "default" ? styles[`btn_${color}`] : ""
        } ${styles[`btn_${size}`]} ${className ? className : ""}`}
        onClick={onClick}
        disabled={disabled}
        {...attributes}
        ref={buttonRef}
      >
        {children}
      </button>
    );
  }
);

export default DefaultButton;
