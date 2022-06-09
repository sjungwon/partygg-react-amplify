import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const clickToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);
  return (
    <div>
      <h1>PartyGG</h1>
      <div>
        <input type="text" placeholder="게임 혹은 사용자 이름" />
        <button>검색</button>
      </div>
      <button onClick={clickToLogin}>로그인</button>
    </div>
  );
}
