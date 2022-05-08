import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import AuthServices from "../services/AuthServices";
import TextValidServices from "../services/TextValidServices";
import styles from "./Register.module.scss";

type RegisterProps = {
  parentMdClose: () => void;
};

export default function Register({ parentMdClose }: RegisterProps) {
  //form 데이터
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  //회원가입 제출 결과 모달
  const [mdShow, setMdShow] = useState<boolean>(false);
  //회원가입 제출시 결과 모달 열기
  const openModal = useCallback(() => {
    setMdShow(true);
  }, []);

  //회원가입 제출 시 결과 모달 닫기 + 현재 모달 닫기
  const closeModal = useCallback(
    (regSuccess: boolean) => {
      return () => {
        setMdShow(false);
        if (regSuccess) {
          parentMdClose();
        }
      };
    },
    [parentMdClose]
  );

  //회원가입 제출
  const submitSignUp = useCallback(async () => {
    if (emailRef.current && usernameRef.current && passwordRef.current) {
      try {
        const user = await AuthServices.signUp({
          username: usernameRef.current.value,
          password: passwordRef.current.value,
          attributes: {
            email: emailRef.current.value,
          },
        });
        console.log(user);
        openModal();
      } catch (error) {
        console.log(error);
        //닉네임 중복 오류 처리 -> 메세지 보여주기
      }
    }
  }, [openModal]);

  //이메일 입력 검증
  const [emailVerify, setEmailVerify] = useState<boolean>(false);
  const [emailVerifyMessage, setEmailVerifyMessage] = useState<string>("");
  const verifyEmail = useCallback(() => {
    const email = emailRef.current?.value;
    if (email) {
      const emailTypeVerify = TextValidServices.isEmailType(email);
      if (!emailTypeVerify) {
        setEmailVerifyMessage("이메일 형식으로 입력해주세요.");
        setEmailVerify(false);
        return;
      }
      setEmailVerifyMessage("");
      setEmailVerify(true);
    }
  }, [emailRef]);

  //이름 입력 검증
  const [nameVerify, setNameVerify] = useState<boolean>(false);
  const [nameVerifyMessage, setNameVerifyMessage] = useState<string>("");
  const verifyUsername = useCallback(() => {
    const name = usernameRef.current?.value;
    if (name && name.length > 8) {
      setNameVerifyMessage("8자 이하로 입력해주세요.");
      setNameVerify(false);
      return;
    }
    setNameVerifyMessage("");
    setNameVerify(true);
  }, [usernameRef]);

  //비밀번호 입력 검증
  const [passwordVerify, setPasswordVerify] = useState<boolean>(false);
  const [passwordVerifyMessage, setPasswordVerifyMessage] =
    useState<string>("");
  const verifyPassword = useCallback(() => {
    const password = passwordRef.current?.value;
    if (password) {
      const textVerify = TextValidServices.isIncludeAlphabet(password);
      if (!textVerify) {
        setPasswordVerifyMessage("문자를 1개 이상 포함해야 합니다.");
        setPasswordVerify(false);
        return;
      }
      const numberVerify = TextValidServices.isIncludeNumber(password);
      if (!numberVerify) {
        setPasswordVerifyMessage("숫자를 1개 이상 포함해야 합니다.");
        setPasswordVerify(false);
        return;
      }
      const lengthVerify = TextValidServices.isLongerthan8(password);
      if (!lengthVerify) {
        setPasswordVerifyMessage("8자 이상 입력해주세요.");
        setPasswordVerify(false);
        return;
      }
      setPasswordVerifyMessage("");
      setPasswordVerify(true);
    }
    setPasswordVerify(false);
  }, [passwordRef]);

  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>
            닉네임 (8자 이하) <span style={{ color: "red" }}> *</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="닉네임을 입력해주세요."
            bsPrefix={`${styles.input}`}
            ref={usernameRef}
            onChange={verifyUsername}
            autoFocus
            required
          />
          <Form.Text className={"danger"} style={{ color: "red" }}>
            {nameVerifyMessage}
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
            ref={emailRef}
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
            ref={passwordRef}
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
          disabled={!emailVerify && !nameVerify && !passwordVerify}
        >
          회원가입
        </Button>
      </Form>
      <Modal
        show={mdShow}
        onHide={closeModal(false)}
        centered
        backdrop={"static"}
        size="sm"
      >
        <Modal.Header className="d-block mx-auto">회원가입</Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: "center" }}>
            가입 완료
            <br />
            **^^**환영합니다.
          </div>
          <Button
            className="mx-auto d-block"
            size="sm"
            onClick={closeModal(true)}
          >
            확인
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
