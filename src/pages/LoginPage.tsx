import { useCallback, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Register from "../components/Register";
import AuthServices from "../services/AuthServices";
import styles from "./LoginPage.module.scss";

export default function LoginPage() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [loginFailMessage, setLoginFailMessage] = useState<string>("");
  const submitRef = useRef<HTMLButtonElement>(null);
  const [mdShow, setMdShow] = useState<boolean>(false);
  const [btnDisabled, setbtnDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>();
  const navigate = useNavigate();

  const openModal = useCallback(() => {
    setMdShow(true);
  }, []);

  const closeModal = useCallback(() => {
    setMdShow(false);
  }, []);

  const validText = useCallback(() => {
    const usernameText = username.current?.value;
    const passwordText = password.current?.value;
    if (usernameText && passwordText) {
      setbtnDisabled(false);
    } else {
      setbtnDisabled(true);
    }
  }, [username, password]);

  const click = async () => {
    const usernameValue = username.current?.value;
    const passwordValue = password.current?.value;

    if (usernameValue && passwordValue) {
      setLoading(true);
      try {
        const user = await AuthServices.signIn({
          username: usernameValue,
          password: passwordValue,
        });
        setUser(user);
        navigate("/");
      } catch (error) {
        console.log(error);
        setLoading(false);
        setLoginFailMessage(
          "닉네임 혹은 비밀번호를 다시 확인하세요. 등록되지 않은 닉네임이거나 닉네임 혹은 비밀번호를 잘못 입력하셨습니다. "
        );
      }
    }
  };

  const enterSubmit = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        submitRef.current?.click();
      }
    },
    [submitRef]
  );

  return (
    <div className={styles.login}>
      <div className={styles.login_card}>
        <div className={styles.login_card__wrapper}>
          <h1 className={styles.login_title}>PartyGG</h1>
          <h2 className={styles.login_subtitle}>
            PartyGG에서 당신의 게임 프로필로 대화해보세요.
          </h2>
          <div className={styles.login_card__bottom}>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label visuallyHidden={true}>닉네임</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  bsPrefix={`${styles.input}`}
                  name="username"
                  ref={username}
                  onChange={validText}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label visuallyHidden={true}>비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  bsPrefix={`${styles.input}`}
                  name="password"
                  ref={password}
                  onChange={validText}
                  onKeyDown={enterSubmit as any}
                  required
                />
              </Form.Group>
              <Form.Text
                id="passwordHelpBlock"
                bsPrefix={styles.login_error__message}
              >
                {loginFailMessage}
              </Form.Text>
              <Button
                bsPrefix={`${styles.login_btn} ${styles.login_btn__login}`}
                disabled={loading || btnDisabled}
                onClick={click}
                ref={submitRef}
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </Form>
            <div className={styles.login_message} tabIndex={0}>
              비밀번호를 잊으셨나요?
            </div>
            <div className={styles.login_line}></div>
            <Button
              bsPrefix={`${styles.login_btn} ${styles.login_btn__register}`}
              onClick={openModal}
            >
              회원가입
            </Button>
            <Modal
              show={mdShow}
              onHide={closeModal}
              centered
              backdrop={"static"}
            >
              <Modal.Header closeButton>
                <span style={{ fontSize: "2rem" }}>회원가입</span>
              </Modal.Header>
              <Modal.Body>
                <Register parentMdClose={closeModal} />
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
