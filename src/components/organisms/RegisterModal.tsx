import {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Form, Modal } from "react-bootstrap";
import AuthServices from "../../services/AuthServices";
import TextValidServices from "../../services/TextValidServices";
import styles from "./scss/RegisterModal.module.scss";
import RegisterConfirmModal from "../molecules/RegisterConfirmModal";
import DefaultTextInput from "../atoms/DefaultTextInput";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";

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
  const verifyUsername: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const usernameText = event.target.value;
      setUsername(usernameText);
      const usernameIncludeSpecial =
        TextValidServices.isIncludePathSpecial(usernameText);
      if (usernameIncludeSpecial) {
        setUsernameVerifyMessage(
          `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
        );
        setUsernameVerify(false);
        return;
      }
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
  const verifyEmail: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const emailText = event.target.value;
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
  const verifyPassword: ChangeEventHandler<HTMLInputElement> = useCallback(
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

  useEffect(() => {
    setUsername("");
    setUsernameVerify(false);
    setUsernameVerifyMessage("");
    setEmail("");
    setEmailVerify(false);
    setEmailVerifyMessage("");
    setPassword("");
    setPasswordVerify(false);
    setPasswordVerifyMessage("");
  }, [parentMdShow]);

  //가입 확인 모달 데이터
  const [registerUsername, setRegisterUsername] = useState<string>("");
  //가입 확인 모달

  const [loading, setLoading] = useState<boolean>(false);
  //회원가입 제출
  const submitSignUp: MouseEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
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
      setLoading(false);
    },
    [modalOpen, username, password, email]
  );

  return (
    <div>
      <Modal
        show={parentMdShow}
        onHide={parentMdClose}
        centered
        backdrop={"static"}
      >
        <Modal.Header closeButton>
          <Modal.Title className={styles.title}>회원가입</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label className={styles.label}>
                사용자 이름 (8자 이하) <span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                placeholder="사용자 이름을 입력해주세요."
                value={username}
                onChange={verifyUsername}
                required
              />
              <Form.Text className={styles.red}>
                {usernameVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className={styles.label}>
                이메일<span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                placeholder="이메일을 입력해주세요."
                value={email}
                onChange={verifyEmail}
                type="email"
                required
              />
              <Form.Text className="text-muted">
                이메일은 가입 확인 및 비밀번호 찾기를 위해 사용합니다.
              </Form.Text>
              <Form.Text id="passwordHelpBlock" className={styles.red}>
                <br />
                {emailVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label className={styles.label}>
                비밀번호 <span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                type="password"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={verifyPassword}
                required
              />
              <Form.Text id="passwordHelpBlock" className={styles.red}>
                {passwordVerifyMessage}
              </Form.Text>
            </Form.Group>
            <DefaultButton
              size="xl"
              onClick={submitSignUp}
              className={styles.submit_btn}
              disabled={!emailVerify || !usernameVerify || !passwordVerify}
            >
              <LoadingBlock loading={loading}>회원가입</LoadingBlock>
            </DefaultButton>
          </Form>
        </Modal.Body>
      </Modal>
      <RegisterConfirmModal
        mdShow={mdShow}
        modalClose={modalClose}
        parentMdClose={parentMdClose}
        username={registerUsername}
      />
    </div>
  );
}
