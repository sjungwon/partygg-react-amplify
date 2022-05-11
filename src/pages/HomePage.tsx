import { useNavigate } from "react-router-dom";
import AuthServices from "../services/AuthServices";
import UserServices from "../services/UserServices";

export default function HomePage() {
  const navigate = useNavigate();

  const click = () => {
    navigate("/login");
  };

  const getUser = async () => {
    try {
      const user = await UserServices.getUser();
      console.log(user);
    } catch {
      console.log("");
    }
  };

  const logout = async () => {
    try {
      await AuthServices.signOut();
    } catch {
      console.log("");
    }
  };

  const refresh = async () => {
    const response = await UserServices.tokenRefresh();
    console.log(response);
  };

  const getProfile = async () => {
    await UserServices.getProfiles();
  };

  const postProfile = async () => {
    await UserServices.postProfiles({
      nickname: "호벗",
      game: "메이플",
      profileImage: "",
    });
  };

  return (
    <div>
      <button onClick={click}>로그인</button>
      <button onClick={logout}>로그아웃</button>
      <button onClick={getUser}>유저</button>
      <button onClick={refresh}>refresh</button>
      <button onClick={getProfile}>프로필</button>
      <button onClick={postProfile}>post profile</button>
    </div>
  );
}
