import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import TextValidServices from "../services/TextValidServices";

export default function useConfirmPassword() {
  //비밀번호 입력 검증
  const [password, setPassword] = useState<string>("");
  const [passwordVerify, setPasswordVerify] = useState<boolean>(false);
  const [passwordVerifyMessage, setPasswordVerifyMessage] =
    useState<string>("");
  const setAndVerifyPassword: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const passwordText = event.target.value;
        setPassword(passwordText);
        const textVerify = TextValidServices.isIncludeAlphabet(passwordText);
        if (!textVerify) {
          setPasswordVerifyMessage("문자를 1개 이상 포함해야 합니다.");
          setPasswordVerify(false);
          return;
        }
        const numberVerify = TextValidServices.isIncludeNumber(passwordText);
        if (!numberVerify) {
          setPasswordVerifyMessage("숫자를 1개 이상 포함해야 합니다.");
          setPasswordVerify(false);
          return;
        }
        const lengthVerify = TextValidServices.isLongerThanNumber(
          passwordText,
          8
        );
        if (!lengthVerify) {
          setPasswordVerifyMessage("8자 이상 입력해주세요.");
          setPasswordVerify(false);
          return;
        }
        setPasswordVerifyMessage("");
        setPasswordVerify(true);
      },
      [setPassword]
    );

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [confirmPasswordVerify, setConfirmPasswordVerify] =
    useState<boolean>(false);
  const [confirmPasswordVerifyMessage, setConfirmPasswordVerifyMessage] =
    useState<string>("");
  const changeConfirmPassword: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setConfirmPassword(event.target.value);
    }, []);

  useEffect(() => {
    if (!confirmPassword) {
      return;
    }
    if (confirmPassword === password) {
      setConfirmPasswordVerify(true);
      setConfirmPasswordVerifyMessage("");
      return;
    }
    const confirmPasswordLonger = TextValidServices.isLongerThanNumber(
      confirmPassword,
      8
    );
    if (!confirmPasswordLonger) {
      setConfirmPasswordVerifyMessage("8자 이상 입력해주세요.");
    } else {
      setConfirmPasswordVerifyMessage(
        "입력하신 비밀번호와 다릅니다. 다시 확인해주세요."
      );
    }
    setConfirmPasswordVerify(false);
  }, [password, confirmPassword]);

  const init = useCallback(() => {
    setPassword("");
    setPasswordVerify(false);
    setPasswordVerifyMessage("");
    setConfirmPassword("");
    setConfirmPasswordVerify(false);
    setConfirmPasswordVerifyMessage("");
  }, []);

  return {
    password,
    passwordVerify,
    passwordVerifyMessage,
    setAndVerifyPassword,
    confirmPassword,
    confirmPasswordVerify,
    confirmPasswordVerifyMessage,
    changeConfirmPassword,
    init,
  };
}
