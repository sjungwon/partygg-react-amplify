import { ChangeEventHandler, FC, useCallback, useState } from "react";
import { Modal } from "react-bootstrap";
import useConfirmPassword from "../../hooks/useConfirmPassword";
import AuthServices from "../../services/AuthServices";
import DefaultButton from "../atoms/DefaultButton";
import DefaultTextInput from "../atoms/DefaultTextInput";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/FindPasswordModal.module.scss";

interface PropsType {
  show: boolean;
  close: () => void;
}

const FindPasswordModal: FC<PropsType> = ({ show, close }) => {
  const [username, setUsername] = useState<string>("");
  const onChangeUsername: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setUsername(event.target.value);
    },
    []
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [usernameMsg, setUsernameMsg] = useState<string>("");

  const submit = useCallback(async () => {
    if (!username) {
      return;
    }
    setLoading(true);
    try {
      await AuthServices.findPassword(username);
      setSuccess(true);
      setUsernameMsg(
        "이메일로 인증번호가 전송됐습니다. 인증 번호를 이용해 새 암호로 변경해주세요."
      );
    } catch (err: any) {
      if (err.code === "LimitExceededException") {
        setUsernameMsg(
          "비밀번호 찾기 요청 횟수가 제한 횟수를 초과했습니다. 24시간 후에 다시 시도해주세요."
        );
      } else {
        setUsernameMsg(
          "등록된 사용자가 아니거나 잘못 입력하셨습니다. 입력하신 사용자 이름을 확인해주세요."
        );
      }

      setSuccess(false);
    }
    setLoading(false);
  }, [username]);

  const {
    password,
    passwordVerify,
    passwordVerifyMessage,
    confirmPassword,
    confirmPasswordVerify,
    confirmPasswordVerifyMessage,
    setAndVerifyPassword,
    changeConfirmPassword,
    init: passwordInit,
  } = useConfirmPassword();

  const [code, setCode] = useState<string>("");
  const [codeMessage, setCodeMessage] = useState<string>("");

  const onChangeCode: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setCode(event.target.value);
    },
    []
  );

  const closeWithInit = useCallback(() => {
    setUsername("");
    setLoading(false);
    setSuccess(false);
    setUsernameMsg("");
    passwordInit();
    setCode("");
    setCodeMessage("");
    close();
  }, [close, passwordInit]);

  const confirmSubmit = useCallback(async () => {
    if (
      !password ||
      !code ||
      !username ||
      !passwordVerify ||
      !confirmPasswordVerify
    ) {
      return;
    }

    try {
      const response = await AuthServices.findPasswordSubmit(
        username,
        code,
        password
      );
      setCodeMessage("");
      console.log(response);
      window.alert("새 비밀번호로 변경되었습니다.");
      closeWithInit();
    } catch (err) {
      setCodeMessage("인증번호를 잘못 입력하셨습니다. 다시 시도해주세요.");
      console.log(err);
    }
  }, [
    closeWithInit,
    code,
    confirmPasswordVerify,
    password,
    passwordVerify,
    username,
  ]);

  return (
    <Modal
      show={show}
      onHide={closeWithInit}
      centered
      backdrop={"static"}
      size="sm"
    >
      <Modal.Header closeButton>비밀번호 찾기</Modal.Header>
      <Modal.Body className={styles.body}>
        <div className={styles.input_block}>
          <label className={styles.label}>사용자 이름 :</label>
          <DefaultTextInput
            value={username}
            onChange={onChangeUsername}
            disabled={success}
          />
        </div>
        <DefaultButton
          size="md"
          onClick={submit}
          disabled={!username || success}
        >
          <LoadingBlock loading={loading}>찾기</LoadingBlock>
        </DefaultButton>
        <p className={styles.message}>{usernameMsg}</p>
        <div className={success ? "" : styles.hide}>
          <div className={styles.input_block}>
            <label className={styles.label}>새 암호 :</label>
            <DefaultTextInput
              value={password}
              onChange={setAndVerifyPassword}
              type="password"
            />
          </div>
          <p className={styles.message}>{passwordVerifyMessage}</p>
          <div className={styles.input_block}>
            <label className={styles.label}>새 암호 확인 :</label>
            <DefaultTextInput
              value={confirmPassword}
              onChange={changeConfirmPassword}
              type="password"
            />
          </div>
          <p className={styles.message}>{confirmPasswordVerifyMessage}</p>
          <div className={styles.input_block}>
            <label className={styles.label}>인증번호 :</label>
            <DefaultTextInput value={code} onChange={onChangeCode} />
          </div>
          <p className={styles.message}>{codeMessage}</p>
          <DefaultButton
            size="md"
            onClick={confirmSubmit}
            disabled={
              !username ||
              !password ||
              !code ||
              !passwordVerify ||
              !confirmPasswordVerify
            }
          >
            변경
          </DefaultButton>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FindPasswordModal;
