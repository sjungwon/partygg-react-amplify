import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import AuthServices from "../services/AuthServices";
import styles from "./RegisterConfirmModal.module.scss";

interface PropsType {
  mdShow: boolean;
  modalClose: () => void;
  parentMdClose: () => void;
  username: string;
}

export default function RegisterConfirmModal({
  mdShow,
  modalClose,
  parentMdClose,
  username,
}: PropsType) {
  const codeRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  //code 입력 없으면 제출 비활성화
  const [codeTextVerify, setCodeTextVerify] = useState<boolean>(false);
  const verifyCodeText = () => {
    if (codeRef.current) {
      setCodeTextVerify(codeRef.current.value.length > 0);
    }
  };

  console.log(username);

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>("");
  const clickSubmit = useCallback(
    async (event: any) => {
      event.preventDefault();
      console.log(username, codeRef.current?.value);
      const code = (codeRef.current as HTMLInputElement).value;
      const success = await AuthServices.confirmSignUp({ username, code });
      if (success) {
        modalClose();
        parentMdClose();
      } else {
        setCodeErrorMessage(
          "코드 확인에 실패했습니다. 코드를 다시 확인해주세요."
        );
      }
    },
    [modalClose, parentMdClose, username]
  );

  const enterSubmit = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        console.log("hi");
        submitRef.current?.click();
      }
    },
    [submitRef]
  );

  useEffect(() => {
    if (!mdShow) {
      setCodeErrorMessage("");
      setCodeTextVerify(false);
    }
  }, [mdShow]);

  if (!username) {
    return null;
  }

  return (
    <Modal
      show={mdShow}
      onHide={modalClose}
      centered
      backdrop={"static"}
      size="sm"
    >
      <Modal.Header closeButton>
        <span className={styles.title}>회원가입 확인</span>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e: any) => {
            e.preventDefault();
          }}
        >
          <Form.Group className="mb-3" controlId="formBasicConfirmCode">
            <Form.Label className={styles.label}>
              {"메일로 전송된 회원가입 확인 코드를 입력해주세요."}
            </Form.Label>
            <div className={styles.input_group}>
              <Form.Control
                type="text"
                placeholder="확인 코드"
                bsPrefix={`${styles.input}`}
                ref={codeRef}
                autoFocus
                onChange={verifyCodeText}
                onKeyDown={enterSubmit as any}
                required
              />
              <Button
                className="d-block"
                size="sm"
                onClick={clickSubmit}
                disabled={!codeTextVerify}
                ref={submitRef}
              >
                확인
              </Button>
            </div>
            <Form.Text id="codeHelpBlock" bsPrefix={styles.code_error__message}>
              {codeErrorMessage}
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
