import {
  ChangeEventHandler,
  CompositionEventHandler,
  forwardRef,
  KeyboardEventHandler,
} from "react";
import styles from "./scss/DefaultTextInput.module.scss";

interface PropsType {
  disabled?: boolean;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
  onKeyDown?: KeyboardEventHandler;
  onCompositionStart?: CompositionEventHandler;
  onCompositionEnd?: CompositionEventHandler;
  required?: boolean;
  type?: "email" | "password" | "text";
  size?: "xl" | "lg";
  autoFocus?: true;
}

const DefaultTextInput = forwardRef<HTMLInputElement, PropsType>(
  (
    {
      disabled,
      value,
      onChange,
      placeholder,
      className,
      onKeyDown,
      onCompositionEnd,
      onCompositionStart,
      required,
      type = "text",
      size,
      autoFocus,
    },
    inputRef
  ) => {
    return (
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={onChange}
        ref={inputRef}
        className={`${styles.input} ${className ? className : ""} ${
          size ? styles[`size_${size}`] : ""
        }`}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        required={required}
      />
    );
  }
);

export default DefaultTextInput;
