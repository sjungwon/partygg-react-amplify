import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RegisterConfirmModal from "../components/molecules/RegisterConfirmModal";
import AuthServices from "../services/AuthServices";
import styles from "./scss/LoginPage.module.scss";
import RegisterModal from "../components/molecules/RegisterModal";
import { UserDataContext } from "../context/UserDataContextProvider";
import { AiOutlineArrowLeft } from "react-icons/ai";
import DefaultButton from "../components/atoms/DefaultButton";
import DefaultTextInput from "../components/atoms/DefaultTextInput";
import LoadingBlock from "../components/atoms/LoadingBlock";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginFailMessage, setLoginFailMessage] = useState<string>("");
  const submitRef = useRef<HTMLButtonElement>(null);
  const [mdShow, setMdShow] = useState<boolean>(false);
  const [btnDisabled, setbtnDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const openModal = useCallback(() => {
    setMdShow(true);
  }, []);

  const closeModal = useCallback(() => {
    setMdShow(false);
  }, []);

  //username input 데이터 state에 저장 + 로그인 버튼 활성화 검증
  const usernameChange = useCallback(
    (event: any) => {
      const usernameText = (event.target as HTMLInputElement).value;
      setUsername(usernameText);
      if (usernameText && password) {
        setbtnDisabled(false);
      } else {
        setbtnDisabled(true);
      }
    },
    [password]
  );

  //password input 데이터 state에 저장 + 로그인 버튼 활성화 검증
  const passwordChange = useCallback(
    (event: any) => {
      const passwordText = (event.target as HTMLInputElement).value;
      setPassword(passwordText);
      if (username && passwordText) {
        setbtnDisabled(false);
      } else {
        setbtnDisabled(true);
      }
    },
    [username]
  );

  //가입 확인 안한 유저에 대한 확인 모달
  const [confirmModalShow, setConfirmModalShow] = useState<boolean>(false);
  const closeConfirmModal = useCallback(() => {
    setConfirmModalShow(false);
  }, []);

  //모달에 전달할 유저 이름 상태
  const [loginUsername, setLoginUserName] = useState<string>("");

  //제출시 로그인 내역 전역 user 데이터에 설정
  const { checkLogin, username: loginUser } = useContext(UserDataContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (loginUser) {
      navigate("/");
    }
  }, [loginUser, navigate]);

  //제출
  const click = async () => {
    if (username && password) {
      setLoading(true);
      try {
        await AuthServices.signIn({
          username,
          password,
        });
        checkLogin();
        navigate(-1);
      } catch (error: any) {
        setLoading(false);
        //가입 확인을 안한 유저이면
        if (error.message === "User is not confirmed.") {
          try {
            //확인 코드 재전송
            await AuthServices.resendConfirmationCode(username);
            //확인 모달 열기
            setLoginFailMessage("");
            setLoginUserName(username);
            setConfirmModalShow(true);
          } catch {
            setLoginFailMessage(
              "가입 코드를 재전송하는데 실패했습니다. 재시도 해주세요."
            );
          }
        } else {
          setLoginFailMessage(
            "닉네임 혹은 비밀번호를 다시 확인하세요. 등록되지 않은 닉네임이거나 닉네임 혹은 비밀번호를 잘못 입력하셨습니다. "
          );
        }
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

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={styles.login}>
      <DefaultButton size="sq_md" onClick={goBack} className={styles.btn_back}>
        <AiOutlineArrowLeft />
      </DefaultButton>
      <div className={styles.login_card}>
        <div className={styles.login_card__wrapper}>
          <h1 className={styles.login_title}>PartyGG</h1>
          <h2 className={styles.login_subtitle}>
            PartyGG에서 당신의 게임 프로필로 대화해보세요.
          </h2>
          <div className={styles.login_card__bottom}>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label visuallyHidden={true}>사용자 이름</Form.Label>
                <DefaultTextInput
                  type="text"
                  placeholder="사용자 이름을 입력해주세요."
                  size="xl"
                  value={username}
                  onChange={usernameChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label visuallyHidden={true}>비밀번호</Form.Label>
                <DefaultTextInput
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  value={password}
                  onChange={passwordChange}
                  onKeyDown={enterSubmit as any}
                  size="xl"
                  required
                />
              </Form.Group>
              <Form.Text
                id="passwordHelpBlock"
                bsPrefix={styles.login_error__message}
              >
                {loginFailMessage}
              </Form.Text>
              <DefaultButton
                size="xl"
                onClick={click}
                disabled={loading || btnDisabled}
                ref={submitRef}
              >
                <LoadingBlock loading={loading}>로그인</LoadingBlock>
              </DefaultButton>
            </Form>
            <div className={styles.find_password} tabIndex={0}>
              비밀번호를 잊으셨나요?
            </div>
            <div className={styles.line}></div>
            <div className={styles.register_container}>
              <DefaultButton size="xl" onClick={openModal} color="blue">
                회원가입
              </DefaultButton>
              <RegisterConfirmModal
                mdShow={confirmModalShow}
                modalClose={closeConfirmModal}
                parentMdClose={() => {}}
                username={loginUsername}
              />
            </div>
            <RegisterModal parentMdShow={mdShow} parentMdClose={closeModal} />
          </div>
        </div>
      </div>
    </div>
  );
}
