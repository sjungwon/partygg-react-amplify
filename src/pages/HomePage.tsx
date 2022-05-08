import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const click = () => {
    navigate("/login");
  };

  return (
    <div>
      <button onClick={click}>로그인</button>
    </div>
  );
}
