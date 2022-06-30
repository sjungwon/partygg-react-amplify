import { forwardRef, useCallback, useState } from "react";
import styles from "./scss/DefaultTextarea.module.scss";

interface PropsType {
  maxLength?: number;
  defaultValue?: string;
  size: "sm" | "lg";
}

const calcByte = (value: string) => {
  const textByte = value
    .split("")
    .map((s) => s.charCodeAt(0))
    .reduce((prev, c) => prev + (c === 10 ? 2 : c >> 7 ? 2 : 1), 0);

  return textByte;
};

const DefaultTextarea = forwardRef<HTMLTextAreaElement, PropsType>(
  ({ maxLength = 500, defaultValue, size }, textAreaRef) => {
    const [currentTextByte, setCurrentTextByte] = useState<number>(
      defaultValue ? calcByte(defaultValue) : 0
    );

    const calcCurrentByte = useCallback(
      (event: any) => {
        const textArea = event.target as HTMLTextAreaElement;
        const value = textArea.value;

        const textByte = calcByte(value);

        if (textByte > maxLength) {
          const over = textByte - maxLength;
          let index = value.length - 1;
          const findArray = value.split("").map((s) => s.charCodeAt(0));
          let count = 0;
          for (let i = value.length - 1; i >= 0; i--) {
            index = i;
            const cur = findArray[i];
            count += cur === 10 ? 2 : cur >> 7 ? 2 : 1;
            if (count >= over) {
              break;
            }
          }
          textArea.value = value.slice(0, index);
          setCurrentTextByte(maxLength);
        } else {
          setCurrentTextByte(textByte);
        }
      },
      [maxLength]
    );

    const textFocusControl = useCallback(
      (e: any) =>
        (e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
          defaultValue ? defaultValue.length : 0),
      [defaultValue]
    );

    return (
      <>
        <textarea
          className={`${styles.textarea} ${styles[`textarea_${size}`]}`}
          ref={textAreaRef}
          autoFocus
          onFocus={textFocusControl}
          onChange={calcCurrentByte}
          placeholder={`${maxLength}Byte 이하로 작성 가능합니다.`}
          defaultValue={defaultValue ? defaultValue : ""}
        />
        <div className={styles.textarea_length}>
          <span>{currentTextByte + " Byte / "}</span>
          <span>{maxLength + " Byte"}</span>
        </div>
      </>
    );
  }
);

export default DefaultTextarea;
