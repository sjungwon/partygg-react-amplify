import { useCallback, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import AuthServices from "../services/AuthServices";
import TextValidServices from "../services/TextValidServices";
import styles from "./RegisterModal.module.scss";
import RegisterConfirmModal from "./RegisterConfirmModal";

type RegisterProps = {
  parentMdShow: boolean;
  parentMdClose: () => void;
};

export default function RegisterModal({
  parentMdShow,
  parentMdClose,
}: RegisterProps) {
  //form 데이터
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  //회원가입 제출 결과 모달
  const [mdShow, setMdShow] = useState<boolean>(false);
  //회원가입 제출시 결과 모달 열기
  const modalOpen = useCallback(() => {
    setMdShow(true);
  }, []);

  //회원가입 제출 시 결과 모달 닫기 + 현재 모달 닫기
  const modalClose = useCallback(() => {
    setMdShow(false);
  }, []);

  //이름 입력 검증
  const [usernameVerify, setUsernameVerify] = useState<boolean>(false);
  const [usernameVerifyMessage, setUsernameVerifyMessage] =
    useState<string>("");
  const verifyUsername = useCallback(
    (event: any) => {
      const usernameText = (event.target as HTMLInputElement).value;
      setUsername(usernameText);
      const usernameLengthVerify = TextValidServices.isShorterThanNumber(
        usernameText,
        8
      );
      if (!usernameLengthVerify) {
        setUsernameVerifyMessage("8자 이하로 입력해주세요.");
        setUsernameVerify(false);
        return;
      }
      setUsernameVerifyMessage("");
      setUsernameVerify(true);
    },
    [setUsername]
  );

  //이메일 입력 검증
  const [emailVerify, setEmailVerify] = useState<boolean>(false);
  const [emailVerifyMessage, setEmailVerifyMessage] = useState<string>("");
  const verifyEmail = useCallback(
    (event: any) => {
      const emailText = (event.target as HTMLInputElement).value;
      setEmail(emailText);
      const emailTypeVerify = TextValidServices.isEmailType(emailText);
      if (!emailTypeVerify) {
        setEmailVerifyMessage("이메일 형식으로 입력해주세요.");
        setEmailVerify(false);
        return;
      }
      setEmailVerifyMessage("");
      setEmailVerify(true);
    },
    [setEmail]
  );

  //비밀번호 입력 검증
  const [passwordVerify, setPasswordVerify] = useState<boolean>(false);
  const [passwordVerifyMessage, setPasswordVerifyMessage] =
    useState<string>("");
  const verifyPassword = useCallback(
    (event: any) => {
      const passwordText = (event.target as HTMLInputElement).value;
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

  //가입 확인 모달 데이터
  const [registerUsername, setRegisterUsername] = useState<string>("");
  //가입 확인 모달
  const confirmModal = useMemo(() => {
    return (
      <RegisterConfirmModal
        mdShow={mdShow}
        modalClose={modalClose}
        parentMdClose={parentMdClose}
        username={registerUsername}
      />
    );
  }, [mdShow, modalClose, parentMdClose, registerUsername]);
  //회원가입 제출
  const submitSignUp = useCallback(async () => {
    try {
      const user = await AuthServices.signUp({
        username,
        password,
        attributes: {
          email,
        },
      });
      console.log(user);
      setRegisterUsername(username);
      modalOpen();
    } catch (error) {
      console.log(error);
      //닉네임 중복 오류 처리 -> 메세지 보여주기
      setUsernameVerifyMessage("닉네임이 중복되었습니다.");
    }
  }, [modalOpen, username, password, email]);

  return (
    <div>
      <Modal
        show={parentMdShow}
        onHide={parentMdClose}
        centered
        backdrop={"static"}
      >
        <Modal.Header closeButton>
          <span style={{ fontSize: "2rem" }}>회원가입</span>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>
                사용자 이름 (8자 이하) <span style={{ color: "red" }}> *</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="사용자 이름을 입력해주세요."
                bsPrefix={`${styles.input}`}
                value={username}
                onChange={verifyUsername}
                autoFocus
                required
              />
              <Form.Text className={"danger"} style={{ color: "red" }}>
                {usernameVerifyMessage}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>
                이메일<span style={{ color: "red" }}> *</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="이메일을 입력해주세요."
                bsPrefix={`${styles.input}`}
                value={email}
                onChange={verifyEmail}
                required
              />
              <Form.Text className="text-muted">
                이메일은 가입 확인 및 비밀번호 찾기를 위해 사용합니다.
              </Form.Text>
              <Form.Text
                id="passwordHelpBlock"
                bsPrefix={styles.login_error__message}
                className={"danger"}
                style={{ color: "red" }}
              >
                <br />
                {emailVerifyMessage}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                비밀번호 <span style={{ color: "red" }}> *</span>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력해주세요."
                bsPrefix={`${styles.input}`}
                value={password}
                onChange={verifyPassword}
                required
              />
              <Form.Text
                id="passwordHelpBlock"
                bsPrefix={styles.login_error__message}
                className={"danger"}
                style={{ color: "red" }}
              >
                {passwordVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Button
              className="mx-auto d-block"
              size="lg"
              onClick={submitSignUp}
              disabled={!emailVerify && !usernameVerify && !passwordVerify}
            >
              회원가입
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {confirmModal}
    </div>
  );
}
